# Stage 1: Build the application
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./
COPY prisma ./prisma

# Install dependencies
RUN npm install

# Copy all source files
COPY . .

# Build the application
RUN npm run build

# Stage 2: Create the final image
FROM node:18-alpine

WORKDIR /app

# Copy dependencies and built files from the builder stage
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/out ./out

# Expose the application port
EXPOSE 3001

ENV HOST=0.0.0.0

# Start the application
CMD ["npm", "start"]
