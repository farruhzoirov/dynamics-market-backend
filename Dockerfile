FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install --force

COPY . .

RUN npm install pm2 -g

RUN npm run build




CMD ["pm2-runtime", "dist/main.js", "-i", "max"]



