FROM node:24-bookworm-slim

WORKDIR /workspace

RUN npm install --global pnpm@10.33.4

COPY . .

RUN pnpm install --frozen-lockfile

ENV NODE_ENV=development
ENV NX_DAEMON=false
ENV PORT=4200
ENV HOSTNAME=0.0.0.0

EXPOSE 4200

CMD ["pnpm", "--dir", "apps/web", "exec", "next", "dev", "--hostname", "0.0.0.0", "--port", "4200"]