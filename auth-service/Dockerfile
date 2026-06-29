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
COPY auth-service/tsconfig.json ./auth-service/
COPY auth-service/src ./auth-service/src

WORKDIR /app/auth-service
RUN npm run build

FROM node:20-alpine AS runtime

ARG VERSION=dev
ARG GIT_SHA=unknown
ARG BUILD_DATE=unknown

LABEL org.opencontainers.image.title="auth-service" \
      org.opencontainers.image.description="Authentification et gestion des utilisateurs" \
      org.opencontainers.image.source="https://github.com/Couscoussiere/refacto_to_do_list" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.licenses="MIT" \
      com.refactotodolist.provides.api-version="v1"

RUN apk update && apk upgrade --no-cache && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/auth-service/package.json ./auth-service/
COPY --from=builder /app/auth-service/dist ./auth-service/dist
COPY auth-service/sql ./auth-service/sql

WORKDIR /app/auth-service
ENV NODE_ENV=production
EXPOSE 3000
USER node
CMD ["node", "dist/index.js"]
