FROM node:16

WORKDIR /benchie

COPY . .

RUN npm ci && npm run build

CMD ["npm", "run", "start"]
