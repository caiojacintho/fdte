# syntax=docker/dockerfile:1
#
# Production-parity image for the `server` workspace only.
# NOT wired into docker-compose.yml - the dev loop stays `npm run dev` at
# the repo root. Build/run this manually, e.g.:
#   docker build -f server/Dockerfile -t fdte-server .
#   docker run --rm -p 4000:4000 --env-file server/.env fdte-server

# ---------------------------------------------------------------------------
# Build stage
# ---------------------------------------------------------------------------
# This is an npm workspaces monorepo: a single workspace can't `npm ci` in
# isolation, since resolution needs the root lockfile plus every other
# workspace's package.json. So the whole repo is copied in before `npm ci`
# runs, rather than trying to build `server/` from an isolated context.
FROM node:20-alpine AS build
WORKDIR /app

COPY . .

RUN npm ci
RUN npm run build -w server

# Strip devDependencies (typescript, tsx, vite, eslint, ...) from the
# already-resolved node_modules tree while the full workspace layout is
# still present (required for npm's workspace resolution to succeed), so
# only production dependencies get copied into the runtime stage below.
RUN npm prune --omit=dev

# ---------------------------------------------------------------------------
# Runtime stage
# ---------------------------------------------------------------------------
FROM node:20-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# Only the compiled server output, its pruned production node_modules, and
# the small source-only local workspace packages it may depend on
# (@fdte/board-kit, @fdte/shared-types) are copied over. The 3 Vite
# frontends' source and ~346MB of committed image assets never make it
# into this image.
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/packages ./packages
COPY --from=build /app/server/package.json ./server/package.json
COPY --from=build /app/server/dist ./server/dist

WORKDIR /app/server
EXPOSE 4000
CMD ["node", "dist/index.js"]
