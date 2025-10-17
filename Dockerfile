FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --no-audit --no-fund

FROM node:20-alpine AS builder
ENV NEXT_TELEMETRY_DISABLED=1
ARG API_URL
ENV VITE_API_URL=${API_URL}
ARG API_TOKENS
ENV VITE_API_TOKENS=${API_TOKENS}
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

FROM node:20-alpine AS runner
ENV NODE_ENV=production
ENV PORT=5173
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/server.js ./server.js

EXPOSE 5173
CMD ["node", "server.js"]


