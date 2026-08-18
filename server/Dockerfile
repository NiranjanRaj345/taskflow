FROM node:20-alpine

RUN apk add --no-cache curl

WORKDIR /app

COPY server/package*.json ./

RUN npm ci --only=production

COPY server/src/ ./src/

RUN addgroup -g 1001 -S appgroup && adduser -u 1001 -S appuser -G appgroup

RUN mkdir -p logs && chown -R appuser:appgroup /app

USER appuser

EXPOSE 5000

CMD ["npm", "start"]
