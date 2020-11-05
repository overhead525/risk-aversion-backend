FROM node:10.23-alpine
WORKDIR /app
ADD package*.json .
RUN npm install

ADD . .

CMD npm run imageServer