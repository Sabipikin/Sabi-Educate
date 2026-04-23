FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Build Next.js app
RUN npm run build

# Expose port 3000 (will be mapped to 3002 in docker-compose)
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
