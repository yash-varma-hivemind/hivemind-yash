FROM node:24-bookworm-slim

WORKDIR /workspace

RUN npm install --global pnpm@10.33.4

COPY . .

RUN pnpm install --frozen-lockfile

ENV NODE_ENV=development
ENV NX_DAEMON=false
ENV PORT=3000

EXPOSE 3000

CMD ["pnpm", "nx", "serve", "api"]