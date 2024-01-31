FROM node:20

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

ENV PORT=443

EXPOSE $PORT

CMD ["npm", "start"]

