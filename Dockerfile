# ================================================
# ELYSIANGO MUTAWWIF API — FINAL DOCKERFILE v3
# Fix for Fly.io Build Failure (npm 404 / COPY error)
# ================================================

FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy ONLY package files first (cache layer)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy rest of the source code
COPY . .

# Expose port
EXPOSE 3020

# Start server
CMD ["node", "server.js"]
