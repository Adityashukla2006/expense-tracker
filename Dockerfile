FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./

#COPY global-bundle.pem /app/

RUN npm ci

COPY . .

EXPOSE 3000

CMD ["npm","start"]
