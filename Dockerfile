FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm ci --omit=dev

COPY . .

RUN npm run build


CMD ["node", "dist/main.js"]



