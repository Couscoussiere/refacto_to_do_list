FROM node:24-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Variante officielle de nginx qui tourne en non-root (utilisateur nginx, UID 101, port 8080)
FROM nginxinc/nginx-unprivileged:1.30-alpine

USER root
RUN apk upgrade --no-cache

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

ARG VERSION=dev
ARG GIT_SHA=unknown
ARG BUILD_DATE=unknown

LABEL org.opencontainers.image.title="frontend" \
      org.opencontainers.image.description="Interface utilisateur React" \
      org.opencontainers.image.source="https://github.com/Couscoussiere/refacto_to_do_list" \
      org.opencontainers.image.version="${VERSION}" \
      org.opencontainers.image.revision="${GIT_SHA}" \
      org.opencontainers.image.created="${BUILD_DATE}" \
      org.opencontainers.image.licenses="MIT" \
      com.refactotodolist.requires.auth-service=">=1.0.0 <2.0.0" \
      com.refactotodolist.requires.project-service=">=1.0.0 <2.0.0" \
      com.refactotodolist.requires.task-service=">=1.0.0 <2.0.0" \
      com.refactotodolist.requires.notification-service=">=1.0.0 <2.0.0"

EXPOSE 8080

USER 101
