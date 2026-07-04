# Build Stage
FROM node:22-bookworm AS builder

WORKDIR /app

ENV NEXT_PUBLIC_WEBSITE_URL=http://localhost:3000
ENV APP_URL=http://localhost:3000

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build


# Run Stage
FROM node:22-bookworm as runner

WORKDIR /app

ENV NODE_ENV=production

COPY --from=builder /app/.next/standalone ./

COPY --from=builder /app/.next/static ./.next/static

COPY --from=builder /app/public ./public

EXPOSE 3000

CMD [ "node", "server.js" ]