FROM node:20-alpine

RUN apk update && apk upgrade --no-cache
RUN npm install -g npm@latest && npm cache clean --force

WORKDIR /app

COPY package.json package-lock.json ./
COPY auth-service/package.json ./auth-service/
COPY project-service/package.json ./project-service/
COPY task-service/package.json ./task-service/
COPY notification-service/package.json ./notification-service/

RUN npm ci

COPY tsconfig.base.json ./
COPY project-service/tsconfig.json ./project-service/
COPY project-service/src ./project-service/src
COPY project-service/sql ./project-service/sql

WORKDIR /app/project-service
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3001

USER node

CMD ["node", "dist/index.js"]
