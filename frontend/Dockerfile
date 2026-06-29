FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY vite.config.ts index.html App.tsx index.tsx styles.css ./
COPY component ./component
COPY constant ./constant
COPY hooks ./hooks
COPY interface ./interface
COPY pages ./pages
COPY service ./service
COPY utils ./utils
RUN npm run build

FROM nginx:alpine

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

RUN apk update && apk upgrade --no-cache

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
