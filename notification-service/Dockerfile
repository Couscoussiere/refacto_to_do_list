FROM node:20-alpine

RUN npm install -g npm@latest && npm cache clean --force

WORKDIR /app
COPY notification-service/package*.json ./
RUN npm ci

COPY tsconfig.base.json /tsconfig.base.json
COPY notification-service/tsconfig.json ./tsconfig.json
COPY notification-service/src ./src

RUN npm run build

ENV NODE_ENV=production
EXPOSE 3003

USER node

CMD ["node", "dist/index.js"]
