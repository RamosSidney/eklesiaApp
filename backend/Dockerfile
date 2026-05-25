FROM node:20-alpine AS base
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=base /app/node_modules ./node_modules
COPY . .
EXPOSE 3001
ENV NODE_ENV=production
CMD ["node", "src/server.js"]
