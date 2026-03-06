# Use the alpine image you already have
FROM node:alpine

# Create app directory
WORKDIR /app

# Install dependencies first for faster caching
COPY package*.json ./
RUN npm install && npm install -g tsx

# Copy the rest of the code (respecting .dockerignore)
COPY . .

# Ensure we use the port provided by Render environment
EXPOSE 9001

# Run the app using tsx (Fastest way for TS in Node)
CMD ["tsx", "index.ts"]