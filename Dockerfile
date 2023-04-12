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
WORKDIR /app
COPY apps/web/ .
COPY --from=FRONT-DEPENDENCIES /app/node_modules ./node_modules
RUN npm build

FROM node:18 as FRONT
WORKDIR /app
ENV NODE_ENV production
# If you are using a custom next.config.js file, uncomment this line.
# COPY --from=builder /my-project/next.config.js ./
COPY --from=FRONT-BUILDER /app/public ./public
COPY --from=FRONT-BUILDER /app/.next ./.next
COPY --from=FRONT-BUILDER /app/node_modules ./node_modules
COPY --from=FRONT-BUILDER /app/package.json ./package.json

EXPOSE 3000
CMD ["npm", "run start"]