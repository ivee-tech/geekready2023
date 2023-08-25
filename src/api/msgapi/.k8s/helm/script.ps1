# create helm chart
helm create pub-cmd-msg

. ..\..\.scripts\base64.ps1

$redisPasswordB64=$(kubectl get secret --namespace redis redis -o jsonpath="{.data.redis-password}")
$redisPasswordB64

$accountKey = '***'
$accountKeyB64 = base64 -data $accountKey
$accountKeyB64


# make required changes in templates and values

# install helm chart

# check current context
kubectl config current-context
# optionally, switch to desired context, e.g. docker-desktop
kubectl config use-context docker-desktop
# PubSub
helm upgrade --install pub-cmd-msg .\pub-cmd-msg `
    --set dapr.azureStorage.accountKey=$accountKeyB64 --set redis.password=$redisPasswordB64

# uninstall
helm uninstall pub-cmd-msg


# 1. Run a Redis pod that you can use as a client:
$ns = 'redis'
. ..\..\.scripts\base64.ps1
$REDIS_PASSWORD=$(kubectl get secret --namespace $ns redis -o jsonpath="{.data.redis-password}" | base64 -d)

kubectl run --namespace $ns redis-client --restart='Never'  --env REDIS_PASSWORD=$REDIS_PASSWORD  --image docker.io/bitnami/redis:6.2 --command -- sleep infinity
kubectl exec --tty -i redis-client --namespace $ns -- bash

# 2. connect using Redis CLI:
REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -h redis-master

# connect to your database from outside the cluster:
kubectl port-forward --namespace $ns svc/redis-master 6379:6379
    & REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli -h 127.0.0.1 -p 6379

# check redis keys
KEYS *
HGETALL '<key>'
XRANGE pub-cmd-msg - +



# troubleshoot
$ns = 'pub-cmd-msg'
$podName = $(kubectl get pods -n $ns --no-headers -o jsonpath='{.items[0].metadata.name}')
kubectl logs $podName -n $ns
kubectl logs $podName -n $ns -c daprd

