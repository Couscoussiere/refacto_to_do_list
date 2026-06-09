FROM node:20-alpine

RUN npm install -g npm@latest && npm cache clean --force

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "dist/index.js"]
