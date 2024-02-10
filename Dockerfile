FROM node:20.11.0-alpine3.18

WORKDIR /usr/app/
COPY ./ /usr/app/

RUN npm config set registry http://registry.npmjs.org/ --global && \
  npm i -g npm@latest && npm i && \
  npm run build && npm prune --production
ENV NODE_PATH=dist/

CMD [ "node", "./dist/index.js" ]
