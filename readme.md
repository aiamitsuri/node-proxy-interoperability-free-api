# 1. Build the image
docker build -t interoperability-node .

# 2. Run the container
docker run -d -p 9001:9001 --name honoproxy interoperability-node

# 3. Check the logs
docker logs -f honoproxy

# 4. Stop the container
docker stop honoproxy && docker rm honoproxy  

  
docker run -it --rm ^
  -p 9001:9001 ^
  -e NODE_ENV=development ^
  -v "%cd%":/app ^
  -w /app ^
  --name honoproxy ^
  node:alpine ^
  sh -c "npm install && npx tsx --watch index.ts"
