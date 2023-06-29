FROM node:lts-alpine as builder
WORKDIR /app
COPY package.json pnpm-lock.yaml ./

RUN corepack enable \
	&& corepack prepare pnpm@latest --activate \
    && pnpm i --frozen-lockfile

COPY . .

ENV NODE_ENV production
RUN echo "DATABASE_URL=\"postgresql://postgres:postgres@localhost:5432/bansapi\"" > .env

RUN pnpm prisma generate \
  && pnpm build \
  && pnpm prune --prod

# Production image
FROM node:lts-alpine AS runner
ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nodejs

USER nodejs
WORKDIR /app

# Copy package.json
COPY --from=builder /app/package.json ./package.json

# Copy dependencies
COPY --from=builder /app/node_modules ./node_modules

# Copy transpiled code
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist

USER nodejs

EXPOSE 3102

ENV PORT 3102

CMD ["node", "dist/main"]
