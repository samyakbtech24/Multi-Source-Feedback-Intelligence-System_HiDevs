# Stage 1: Build the React application
FROM node:20-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Set Vite env variable during build time.
# In a local setup, it connects to localhost:8000.
ARG VITE_API_URL="http://localhost:8000"
ENV VITE_API_URL=$VITE_API_URL

RUN npm run build

# Stage 2: Serve the build files using Nginx
FROM nginx:alpine

# Copy built static files from Stage 1 to Nginx public folder
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80 (HTTP)
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
