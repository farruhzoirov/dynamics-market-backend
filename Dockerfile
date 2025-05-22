FROM node:18-alpine

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install --force

COPY . .


RUN npm run build

CMD ["node", "amocrm0-auth.js"]

CMD ["node", "dist/main.js"]


