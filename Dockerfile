FROM node:18 as BUILD
WORKDIR /app

# Copy root package.json and lockfile
COPY package.json ./

# Copy the docs package.json
COPY apps/server/package.json ./apps/server/package.json
COPY apps/web/package.json ./apps/web/package.json

RUN turbo run install
COPY . .
RUN turbo run build

FROM node:18 as BACK
WORKDIR /app
COPY --from=BUILD /app/apps/server/dist .

EXPOSE 8080
CMD ["node", "src/server.js"]

#FROM node:1.23
#COPY --from=BUILD /app/apps/web/.next .
#EXPOSE 3000
#COPY ["node", "server/"