@echo off
docker run --rm -v "%cd%:/app" denoland/deno run --allow-read --allow-write --allow-net /app/main.ts %1
