FROM node:20-alpine

RUN apk update && apk upgrade --no-cache
RUN npm install -g npm@latest && npm cache clean --force

WORKDIR /app

COPY task-service/package*.json ./
RUN npm ci

COPY tsconfig.base.json /tsconfig.base.json
COPY task-service/tsconfig.json ./tsconfig.json
COPY task-service/src ./src

COPY task-service/sql ./sql

RUN npm run build

ENV NODE_ENV=production
EXPOSE 3002

USER node

CMD ["node", "dist/index.js"]
