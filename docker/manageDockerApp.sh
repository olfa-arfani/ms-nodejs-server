#!/usr/bin/env bash
if [[ "$1" == "start" ]]
then
    docker-compose -f docker-compose.yaml up
elif [[ "$1" == "stop" ]]
  then 
    docker-compose -f docker-compose.yaml down
else
  echo "Please use supported parameter start/stop"
fi
