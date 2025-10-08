# Build stage
FROM node:20-alpine AS build

WORKDIR /app

# Copy package files
COPY package.json bun.lockb ./

# Install all dependencies (including dev dependencies for build)
RUN npm install -g bun && bun install --frozen

# Copy source code
COPY . .

# Set environment variables for build (empty = use relative paths from code)
ENV VITE_API_URL=

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from build stage
COPY --from=build /app/dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port 80
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/index.html || exit 1

# Start nginx
CMD ["nginx", "-g", "daemon off;"]