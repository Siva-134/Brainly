# base image
FROM node:22-alpine

WORKDIR /app

# optimization the layers now catched as it is main major extensive highh time taken operation

COPY ./package.json ./package.json
COPY ./package-lock.json ./package-lock.json


RUN npm install


COPY . .

EXPOSE 3000

CMD ["node" ,"app.js"]