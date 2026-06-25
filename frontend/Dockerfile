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

RUN apk update && apk upgrade --no-cache

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
