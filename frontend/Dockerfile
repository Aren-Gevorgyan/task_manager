FROM node:20-alpine

WORKDIR /app

# Copy package files first so Docker can cache dependency install layers.
COPY package*.json ./

# Install dependencies required by the Vite frontend service.
RUN npm install

# Copy source after dependencies to keep rebuilds faster during iteration.
COPY . .

EXPOSE 5173

# Default command is overridden by docker-compose for dev/live reload.
CMD ["npm", "run", "dev"]
