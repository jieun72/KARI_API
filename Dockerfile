FROM node:12
WORKDIR /usr/src/app
COPY ./app.js .
EXPOSE 3001
CMD ["node", "app.js"]
