# ======================================
# ELYSIANGO MUTAWWIF API — FIXED DOCKERFILE
# Fly.io compatible — Node 20 Alpine
# ======================================

FROM node:20-alpine

# Create app directory
WORKDIR /app

# Copy package.json first
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the app
COPY . .

# Expose port
EXPOSE 3020

# Run server
CMD ["node", "server.js"]

