FROM node:24-alpine

WORKDIR /app
COPY --chown=node:node mock-api/mock-api.mjs ./mock-api.mjs
USER node
EXPOSE 8080
CMD ["node", "mock-api.mjs"]
