# start the api locally
uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# build container image
$tag = '0.0.1'
docker build -t sec-oai-api:$($tag) .

docker scout quickview

# run container locally
$oaiApiKey = $env:OPENAI_API_KEY
docker run -d --name oai-api -e OPENAI_API_KEY=$oaiApiKey -p 8000:80 sec-oai-api:$($tag)
