FROM node:12-alpine

ENV PORT 8080
#ENV NPM_CONFIG_LOGLEVEL info

COPY package*.json ./

RUN npm install

WORKDIR /home/node/app

COPY . /home/node/app/

CMD [ "node", "server.js" ]

