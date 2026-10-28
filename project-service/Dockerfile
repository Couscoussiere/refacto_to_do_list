FROM node:24-alpine AS builder

RUN apk upgrade --no-cache && \
    apk add --no-cache python3 make g++ && \
    npm install -g npm@11 && npm cache clean --force

WORKDIR /app

COPY package.json package-lock.json ./
COPY project-service/package.json ./project-service/
COPY task-service/package.json ./task-service/
COPY notification-service/package.json ./notification-service/

RUN npm ci

COPY tsconfig.base.json ./
COPY project-service/tsconfig.json ./project-service/
COPY project-service/src ./project-service/src

WORKDIR /app/project-service
RUN npm run build && \
    npm prune --omit=dev --prefix /app

FROM node:24-alpine AS runtime

RUN apk upgrade --no-cache && \
    rm -rf /usr/local/lib/node_modules/npm /usr/local/bin/npm /usr/local/bin/npx

WORKDIR /app

COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./
COPY --from=builder /app/project-service/package.json ./project-service/
COPY --from=builder /app/project-service/dist ./project-service/dist
COPY project-service/sql ./project-service/sql

ARG VERSION=dev
ARG GIT_SHA=unknown
ARG BUILD_DATE=unknown

LABEL org.opencontainers.image.title="project-service" \
      org.opencontainers.image.description="Gestion des projets" \
      org.opencontainers.image.source="https://github.com/Couscoussiere/refacto_to_do_list" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.licenses="MIT" \
      com.refactotodolist.provides.api-version="v1" \
      com.refactotodolist.requires.auth-service=">=1.0.0 <2.0.0" \
      com.refactotodolist.requires.task-service=">=1.0.0 <2.0.0"

WORKDIR /app/project-service

ENV NODE_ENV=production

EXPOSE 3001

USER node

CMD ["node", "dist/index.js"]
