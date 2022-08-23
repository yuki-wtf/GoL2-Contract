FROM node:16.15.1

ADD indexer/ /app
WORKDIR /app

RUN yarn install && yarn build

CMD ["yarn","start"]