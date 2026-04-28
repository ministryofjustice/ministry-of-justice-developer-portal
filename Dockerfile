FROM node:25-bookworm-slim AS build
WORKDIR /app

# Install git for content ingestion
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY scripts ./scripts
RUN npm ci

COPY . .
RUN npm run ingest
RUN npm run build

FROM nginx:1.29-alpine

# Create nginx cache directories and set ownership for non-root user (101)
RUN mkdir -p /var/cache/nginx/client_temp \
             /var/cache/nginx/proxy_temp \
             /var/cache/nginx/fastcgi_temp \
             /var/cache/nginx/uwsgi_temp \
             /var/cache/nginx/scgi_temp \
             /var/run/nginx && \
    chown -R 101:101 /var/cache/nginx /var/run/nginx /usr/share/nginx/html && \
    chmod -R 755 /var/cache/nginx /var/run/nginx

# Copy custom nginx configs for non-root operation
COPY .github/nginx/nginx.conf /etc/nginx/nginx.conf
COPY .github/nginx/default.conf /etc/nginx/conf.d/default.conf

# Copy built static site
COPY --from=build /app/out /usr/share/nginx/html

# Run as non-root user
USER 101

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
