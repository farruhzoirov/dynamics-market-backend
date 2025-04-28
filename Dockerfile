FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install --force

COPY . .


RUN npm run build


CMD ["node", "dist/main.js"]



