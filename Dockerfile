# 1. Base image sifatida Node.js foydalanamiz
FROM node:18

WORKDIR /usr/src/app

COPY package.json package-lock.json ./

RUN npm install --force

COPY . .

RUN npm run build


ENV PORT=$PORT


EXPOSE $PORT

CMD ["node", "dist/main.js"]



