#! /bin/bash
cd `dirname $0`
docker run --rm -v "$PWD:/app" denoland/deno run --allow-read --allow-write --allow-net /app/main.ts $1 $2