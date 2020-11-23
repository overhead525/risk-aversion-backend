FROM node:14.15.1
VOLUME [ "." ]
WORKDIR /app
# ADD package*.json .
ADD . .
RUN npm install

CMD npm run server