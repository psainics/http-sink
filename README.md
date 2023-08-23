# http-sink

docker build . -t my-http-mock-sink
docker run -p 3000:3000 -d my-http-mock-sink

/http-sink
/sink

## Proxy config

use_backend mockhttpsink if { path /sink } || { path_beg /sink/ }  || { path_beg /http-sink }  || { path_beg /http-sink/ } 


backend mockhttpsink
    mode http
    server s1 127.0.0.1:3000check
