import datetime
from fastapi import FastAPI
import os
import openai
import json
from pydantic import BaseModel
import tiktoken
from fastapi.middleware.cors import CORSMiddleware
import random, string
from fastapi import File, UploadFile
import requests
import uuid


class CmdMsgRequest(BaseModel):
    args: str

app = FastAPI()

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/answer")
async def root(msg: str, type: str, dummy: bool = False):
    config_details = load_config()       
    # Setting up the deployment name
    chatgpt_model_name = config_details['CHATGPT_MODEL']
    # response = get_chat_response(chatgpt_model_name, msg)
    
    match type:
        case "sec":
            system_message = get_sec_system_message()
        case "k8s":
            system_message = get_k8s_system_message()
        case "gen":
            system_message = get_gen_system_message()
        case _:
            system_message = get_gen_system_message()
    messages = [{"sender": "user", "text": msg}]
    max_response_tokens = 500
    prompt = create_prompt(system_message, messages)
    if dummy:
        response = ''
        i = 0
        for i in range(0, 9):
            response += random_str(10) + '\n```My ' + repr(i) + ' == ' + random_str(5) + ' --Code !@#$%^&*()```\n' + random_str(10) + '\n\n'
    else:
        response = send_message(prompt, chatgpt_model_name, max_response_tokens)
        
    print(response)
    messages.append({"sender": "assistant", "text": response})
    # Create the full prompt
    return {
        "messages": messages 
    }

@app.post("/api/upload")
def upload(file: UploadFile = File(...)):
    try:
        contents = file.file.read()
        fn = 'data/' + file.filename
        with open(fn, 'wb') as f:
            f.write(contents)
    except Exception:
        return {"message": "There was an error uploading the file"}
    finally:
        file.file.close()
    json_data = ''
    try:
        with open(fn, encoding='utf-8') as json_file:
            json_data = json.load(json_file)
    except Exception as e:
        print(f"Error loading JSON file: {e}")
    # print(json_data)
    return {"message": f"Successfully uploaded {file.filename}", "data": json_data}

@app.post("/api/cmd-msg")
def sendCommandMessage(req: CmdMsgRequest):
    url = 'http://localhost:30334/api/cmd-msg'
    d = datetime.datetime.now()
    sd = d.strftime("%Y%m%dT%H%M%S")
    request = { 
        "data": {
            # "id": uuid.uuid4(),
            "name": '',
            "description": '',
            "tool": '',
            "version": '',
            "command": '',
            "arguments": req.args,
            # "arguments": 'docker.io/daradu/pub-cmd-msg-api:0.0.1 --format sarif --skip-db-update --output ./results/pub-cmd-msg-api.sarif',
            "schedule": '',
            "target": '', # ADO, GH, ZZ
            "fullCommand": '',
            "outputPath": '',
            "outputFileName": ''
        }
    }
    r = requests.post(url, json=request)
    print(r.status_code)
    # print(r.json())
    return {"message": f"Successfully sent command message."}

def load_config():
    with open(r'config.json') as config_file:
        config_details = json.load(config_file)

    # This is set to `azure`
    openai.api_type = "azure"

    # The API key for your Azure OpenAI resource.
    openai.api_key = os.getenv("OPENAI_API_KEY")

    # The base URL for your Azure OpenAI resource. e.g. "https://<your resource name>.openai.azure.com"
    openai.api_base = config_details['OPENAI_API_BASE']

    # Currently Chat Completion API have the following versions available: 2023-03-15-preview
    openai.api_version = config_details['OPENAI_API_VERSION']

    return config_details

def get_gen_system_message():
    base_system_message = """
You are a code generator assistant. You help come up with creative content ideas and content like classes, properties, and methods. 
Ensure that the generated code follows the best practices and is production ready. You can also help with the deployment of the generated code to various environments.
Ensure that the generated code is secure it is aligned to Azure security baseline.
You write in a friendly yet professional tone and you can tailor your writing style that best works for a user-specified audience. 
""" + get_additional_instructions()

    system_message = f"<|im_start|>system\n{base_system_message.strip()}\n<|im_end|>"
    print(system_message)
    return system_message

def get_k8s_system_message():
    base_system_message = """
You are a Kubernetes code generator assistant. You help come up with creative content ideas and content like deployment, service, config maps and secret manifests. 
Ensure that the generated code follows the best practices and is production ready. You can also help with the deployment of the generated code to the Kubernetes cluster.
Ensure that the generated code is secure it is aligned to Azure containers security baseline.
You write in a friendly yet professional tone and you can tailor your writing style that best works for a user-specified audience. 
""" + get_additional_instructions()

    system_message = f"<|im_start|>system\n{base_system_message.strip()}\n<|im_end|>"
    print(system_message)
    return system_message

def get_sec_system_message():
    base_system_message = """
You are a Cybersecurity code generator assistant. You help come up with creative content ideas and content like best security practices, security development lifecycle, threat modelling techniques, SAST, DAST, security scanning tools. 
Ensure that the generated code follows the best practices and is production ready. You can also help with the integration of scanning tools in Azure Pipelines or GitHub Actions.
Ensure that the generated code is secure it is aligned to Azure containers security baseline.
You can focus on vulnerability scanning tools such as Trivy, SonarQube (Sonar Scanner), Microsoft Security DevOps (aka Guardian), OWASP ZAP, Snyk, etc.
You write in a friendly yet professional tone and you can tailor your writing style that best works for a user-specified audience. 
""" + get_additional_instructions()

    system_message = f"<|im_start|>system\n{base_system_message.strip()}\n<|im_end|>"
    print(system_message)
    return system_message

def get_additional_instructions():
    instructions = """
Additional instructions:
- Make sure you understand your user's audience so you can best write the content.
- Ask clarifying questions when you need additional information. Examples include asking about the audience or medium for the content.
- Don't write any content that could be harmful.
- Don't write any content that could be offensive or inappropriate.
- Don't write any content that speaks poorly of any product or company.
"""
    return instructions

# Defining a function to create the prompt from the system message and the messages
# The function assumes `messages` is a list of dictionaries with `sender` and `text` keys
# Example: messages = [{"sender": "user", "text": "I want to write a blog post about my company."}]
def create_prompt(system_message, messages):
    prompt = system_message
    for message in messages:
        prompt += f"\n<|im_start|>{message['sender']}\n{ message['text']}\n<|im_end|>"
    prompt += "\n<|im_start|>assistant\n"
    return prompt

# Defining a function to estimate the number of tokens in a prompt
def estimate_tokens(prompt):
    cl100k_base = tiktoken.get_encoding("cl100k_base") 

    enc = tiktoken.Encoding( 
        name="chatgpt",  
        pat_str=cl100k_base._pat_str, 
        mergeable_ranks=cl100k_base._mergeable_ranks, 
        special_tokens={ 
            **cl100k_base._special_tokens, 
            "<|im_start|>": 100264, 
            "<|im_end|>": 100265
        } 
    ) 

    tokens = enc.encode(prompt,  allowed_special={"<|im_start|>", "<|im_end|>"})
    return len(tokens)

# Defining a function to send the prompt to the ChatGPT model
def send_message(prompt, model_name, max_response_tokens=500):
    try:
        response = openai.Completion.create(
            engine=model_name,
            prompt=prompt,
            temperature=0, # 0.5,
            max_tokens=max_response_tokens,
            top_p=0.9,
            frequency_penalty=0,
            presence_penalty=0,
            stop=['<|im_end|>']
        )
        return response['choices'][0]['text'].strip()
        
    except openai.error.APIError as e:
        # Handle API error here, e.g. retry or log
        print(f"OpenAI API returned an API Error: {e}")

    except openai.error.AuthenticationError as e:
        # Handle Authentication error here, e.g. invalid API key
        print(f"OpenAI API returned an Authentication Error: {e}")

    except openai.error.APIConnectionError as e:
        # Handle connection error here
        print(f"Failed to connect to OpenAI API: {e}")

    except openai.error.InvalidRequestError as e:
        # Handle connection error here
        print(f"Invalid Request Error: {e}")

    except openai.error.RateLimitError as e:
        # Handle rate limit error
        print(f"OpenAI API request exceeded rate limit: {e}")

    except openai.error.ServiceUnavailableError as e:
        # Handle Service Unavailable error
        print(f"Service Unavailable: {e}")

    except openai.error.Timeout as e:
        # Handle request timeout
        print(f"Request timed out: {e}")
        
    except:
        # Handles all other exceptions
        print("An exception has occured.")

def get_chat_response(chatgpt_model_name, userMessage, type):
    # A sample API call for chat completions looks as follows:
    # Messages must be an array of message objects, where each object has a role (either "system", "user", or "assistant") and content (the content of the message).
    # For more info: https://learn.microsoft.com/en-us/azure/cognitive-services/openai/reference#chat-completions

    # Enumerate thread modelling techniques
    try:
        match type:
            case "sec":
                system_message = get_sec_system_message()
            case "k8s":
                 system_message = get_k8s_system_message()
            case "gen", _:
                system_message = get_gen_system_message()
        response = openai.ChatCompletion.create(
                    engine=chatgpt_model_name,
                    messages=[
                            {"role": "system", "content": system_message},
                            {"role": "user", "content": userMessage}
                        ]
                    )

        # print the response
        print(response['choices'][0]['message']['content'])
        return response
        
    except openai.error.APIError as e:
        # Handle API error here, e.g. retry or log
        print(f"OpenAI API returned an API Error: {e}")

    except openai.error.AuthenticationError as e:
        # Handle Authentication error here, e.g. invalid API key
        print(f"OpenAI API returned an Authentication Error: {e}")

    except openai.error.APIConnectionError as e:
        # Handle connection error here
        print(f"Failed to connect to OpenAI API: {e}")

    except openai.error.InvalidRequestError as e:
        # Handle connection error here
        print(f"Invalid Request Error: {e}")

    except openai.error.RateLimitError as e:
        # Handle rate limit error
        print(f"OpenAI API request exceeded rate limit: {e}")

    except openai.error.ServiceUnavailableError as e:
        # Handle Service Unavailable error
        print(f"Service Unavailable: {e}")

    except openai.error.Timeout as e:
        # Handle request timeout
        print(f"Request timed out: {e}")
        
    except:
        # Handles all other exceptions
        print("An exception has occured.")

def random_str(length):
   letters = string.ascii_lowercase
   return ''.join(random.choice(letters) for i in range(length))
