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