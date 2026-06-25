FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY frontend/package*.json ./frontend/
RUN npm ci && npm ci --prefix frontend

COPY prisma ./prisma
COPY src ./src
COPY frontend ./frontend

RUN npx prisma generate
RUN npm run build --prefix frontend

FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

RUN apk add --no-cache openssl

COPY package*.json ./
RUN npm ci --omit=dev

COPY prisma ./prisma
COPY src ./src
COPY scripts/docker-entrypoint.sh ./scripts/docker-entrypoint.sh
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/frontend/dist ./frontend/dist

RUN npx prisma generate && chmod +x ./scripts/docker-entrypoint.sh

EXPOSE 8080

CMD ["./scripts/docker-entrypoint.sh"]
