FROM node:20-alpine AS builder

RUN apk add --no-cache python3 make g++
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
COPY task-service/tsconfig.json ./task-service/
COPY task-service/src ./task-service/src

WORKDIR /app/task-service
RUN npm run build

FROM node:20-alpine AS runtime

RUN apk update && apk upgrade --no-cache
RUN rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/task-service/package.json ./task-service/
COPY --from=builder /app/task-service/dist ./task-service/dist

WORKDIR /app/task-service
ENV NODE_ENV=production
EXPOSE 3002
USER node
CMD ["node", "dist/index.js"]
