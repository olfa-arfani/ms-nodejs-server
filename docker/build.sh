#!/usr/bin/env bash
echo $(date -u) "Building docker image"
docker build ../ -t aolfa/ms-employee:latest -t aolfa/ms-employee:local
echo $(date -u) "Docker image build"
