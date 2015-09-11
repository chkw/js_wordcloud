#!/bin/sh
PYTHON=`which python`

PATH="./"

PORT="9885"

echo "server listening on port $PORT"
$PYTHON ./static_server.py $PATH $PORT
