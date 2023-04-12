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

#FROM node:1.23
#COPY --from=BUILD /app/apps/web/.next .
#EXPOSE 3000
#COPY ["node", "server/"