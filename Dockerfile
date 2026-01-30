# ---------- Build stage ----------
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install --only=production

COPY . .
RUN npm run build


# ---------- Runtime stage ----------
FROM node:18-alpine

WORKDIR /app

COPY --from=build /app /app

# Start server
CMD ["node", "src/server.js"]
