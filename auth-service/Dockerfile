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
COPY auth-service/tsconfig.json ./auth-service/
COPY auth-service/src ./auth-service/src

WORKDIR /app/auth-service
RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

USER node

CMD ["node", "dist/index.js"]
