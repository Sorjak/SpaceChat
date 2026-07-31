FROM node:alpine AS builder

WORKDIR /app
COPY package-lock.json .
COPY package.json .
RUN npm install

FROM node:alpine AS app

WORKDIR /app
COPY --from=builder /app/node_modules /app/node_modules

COPY src /app

EXPOSE 3001
CMD ["node", "/app/server/app.js"]
