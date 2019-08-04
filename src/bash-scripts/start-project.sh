#!/usr/bin/env bash

pwd
echo $1
cd $1

pwd

source .env

npm install --silent
npm run dev
