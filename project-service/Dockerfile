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

RUN npm run build

ENV NODE_ENV=production
EXPOSE 3001

USER node

CMD ["node", "dist/index.js"]
