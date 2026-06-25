FROM node:20-alpine

RUN apk update && apk upgrade --no-cache
RUN npm install -g npm@latest && npm cache clean --force

WORKDIR /app

COPY auth-service/package*.json ./
RUN npm ci

COPY tsconfig.base.json /tsconfig.base.json
COPY auth-service/tsconfig.json ./tsconfig.json
COPY auth-service/src ./src

COPY auth-service/sql ./sql

RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

USER node

CMD ["node", "dist/index.js"]
