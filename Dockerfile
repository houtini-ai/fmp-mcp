# syntax=docker/dockerfile:1
#
# Container image for @houtini/fmp-mcp (stdio MCP server).
# build/ is gitignored -> build from source (tsc). Runtime config: FMP_API_KEY.
#
# Build: docker build -t mcp/fmp .

# --- build stage ------------------------------------------------------------
FROM node:22-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts || npm install --ignore-scripts
COPY . .
RUN npm run build

# --- runtime: production deps + built output --------------------------------
FROM node:22-slim
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev --ignore-scripts || npm install --omit=dev --ignore-scripts
COPY --from=build /app/build ./build
ENTRYPOINT ["node", "build/index.js"]
