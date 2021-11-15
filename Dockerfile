FROM node:12 AS Build

WORKDIR /app

COPY . .

RUN npm install

FROM node:12-alpine

WORKDIR /app

RUN apk add --no-cache tzdata

ENV TZ="Asia/Shanghai"

RUN npm install

EXPOSE 8086

CMD [ "npm", "run", "online" ]
