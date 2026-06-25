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
COPY notification-service/tsconfig.json ./notification-service/
COPY notification-service/src ./notification-service/src

WORKDIR /app/notification-service
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3003

USER node

CMD ["node", "dist/index.js"]
