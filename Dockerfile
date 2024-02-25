FROM node:20.11.0-alpine3.18

WORKDIR /usr/app/
COPY ./ /usr/app/

RUN apk add --no-cache tzdata && \
  cp /usr/share/zoneinfo/Asia/Yekaterinburg /etc/localtime && \
  echo "Asia/Yekaterinburg" > /etc/timezone && \
  apk del tzdata

ENV TZ="Asia/Yekaterinburg"

RUN npm i && \
  npm run build && npm prune --production

ENV NODE_PATH=dist/

CMD [ "node", "./dist/index.js" ]
