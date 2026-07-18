FROM node:20-alpine

WORKDIR /app

COPY backend/package*.json ./backend/

WORKDIR /app/backend
RUN npm install

COPY backend/prisma ./prisma/
RUN npx prisma generate

COPY backend/tsconfig.json ./
COPY backend/src ./src/
COPY submission.json /app/submission.json

RUN npm run build

EXPOSE 4000

CMD ["sh", "-c", "npx prisma db push --accept-data-loss && npm run seed && npm run start"]
