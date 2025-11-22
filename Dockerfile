# --- Base image ---
FROM node:18-alpine

# --- Work directory ---
WORKDIR /app

# --- Copy package files ---
COPY package*.json ./

# --- Install dependencies ---
RUN npm install

# --- Copy all files ---
COPY . .

# --- Expose port ---
EXPOSE 3020

# --- Start server ---
CMD ["node", "server.js"]
