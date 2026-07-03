# Ibokki game server + built web client, one image.
# Built by .github/workflows/publish.yml → ghcr.io/<owner>/ibokki-game
FROM node:20-bookworm-slim AS build
# Toolchain for native modules (better-sqlite3/argon2 compile when no prebuilt
# binary matches the image's node build — the slim image has no gyp deps).
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY package.json package-lock.json tsconfig.json tsconfig.base.json ./
COPY apps ./apps
COPY packages ./packages
COPY tools ./tools
RUN npm ci
# Client is built for the /play mount point used by the site's nginx.
ARG IBOKKI_BASE=/play/
RUN IBOKKI_BASE=$IBOKKI_BASE npm run build:client

FROM node:20-bookworm-slim
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app /app
EXPOSE 7788
# tsx runs the TS sources directly — same as dev, no build drift.
CMD ["node", "--import", "tsx", "apps/server/src/server.ts"]
