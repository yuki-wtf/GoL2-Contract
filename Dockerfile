FROM node:16.15.1

ADD indexer/ /app
WORKDIR /app
RUN --mount=type=secret,id=certificate \
          cat /run/secrets/certificate >> /app/ca-certificate.crt

RUN yarn install && yarn build

CMD ["yarn","start"]