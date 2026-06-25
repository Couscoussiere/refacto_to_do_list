FROM node:20-alpine

RUN apk update && apk upgrade --no-cache
RUN npm install -g npm@latest && npm cache clean --force

WORKDIR /app

COPY project-service/package*.json ./
RUN npm ci

COPY tsconfig.base.json /tsconfig.base.json
COPY project-service/tsconfig.json ./tsconfig.json
COPY project-service/src ./src

COPY project-service/sql ./sql

RUN npm run build

ENV NODE_ENV=production
EXPOSE 3001

USER node

CMD ["node", "dist/index.js"]
