$data = "1+2"
$baseUrl = 'https://localhost:30334/'
$url = "$($baseUrl)/api/cmd-msg"
$data = @{ data = $data }
$contentType = 'application/json'
$method = 'POST'
$body = $data | ConvertTo-Json
$result = Invoke-WebRequest -Uri $url -Body $body -Method $method -ContentType $contentType
$result

# container
# from api sol folder
$tag='0.0.1'
docker build -t pub-cmd-msg-api:$($tag) --build-arg USE_ENV_VAR=true -f .\PubSub.Web.Api\Dockerfile .

# push to docker hub
$tag='0.0.1'
$image='pub-cmd-msg-api'
$registry='docker.io'
$img="${image}:${tag}"
$ns='daradu' # namespace
docker tag ${img} ${registry}/${ns}/${img}
# requires docker login
docker push ${registry}/${ns}/${img}
