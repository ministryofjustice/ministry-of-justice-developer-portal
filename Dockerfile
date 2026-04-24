FROM node:24-bookworm-slim AS build
WORKDIR /app

# Install git for content ingestion
RUN apt-get update && apt-get install -y git && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run ingest
RUN npm run build

FROM nginx:1.29-alpine
COPY .github/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/out /usr/share/nginx/html

EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
