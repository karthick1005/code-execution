FROM node:16

WORKDIR /usr/src/app

COPY . .
RUN npm i express child_process path
EXPOSE 5000

CMD ["node", "index.js"]
