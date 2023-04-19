FROM node:18 as BACK-BUILD
WORKDIR /app

# Copy root package.json and lockfile
COPY apps/server/package.json .
RUN npm i
COPY apps/server .
RUN npm run build

FROM node:18 as BACK-REMOVER
WORKDIR /app
COPY --from=BACK-BUILD /app/package*.json /app/dist ./

RUN npm i --only=production

FROM node:18 as BACK
WORKDIR /app
COPY --from=BACK-REMOVER /app /app/node_modules ./

EXPOSE 8080
CMD ["node", "src/server.js"]

FROM node:18 as FRONT-DEPENDENCIES
WORKDIR /app
COPY apps/web/package.json ./
RUN npm install


FROM node:18 as FRONT-BUILDER

ENV NEXT_TELEMETRY_DISABLED 1

WORKDIR /app
COPY apps/web/ .
COPY --from=FRONT-DEPENDENCIES /app/node_modules ./node_modules
RUN npm run build

FROM node:18 as FRONT

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app
# If you are using a custom next.config.js file, uncomment this line.
# COPY --from=builder /my-project/next.config.js ./
COPY --from=FRONT-BUILDER --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=FRONT-BUILDER --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT 3000

CMD ["node", "server.js"]