# Use Bun as the base image
FROM oven/bun:latest as build-stage

# Set working directory
WORKDIR /app

# Copy package.json and lockfile
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install

# Copy the rest of the application
COPY . .

# Build the Nuxt application
RUN bun run build

# Production stage
FROM node:alpine as production-stage

WORKDIR /app

# Copy the built application from the build stage
COPY --from=build-stage /app/.output /app/.output

# Expose the port the app runs on
EXPOSE 3000

# Set environment variable
ENV NODE_ENV=production

# Command to run the application
CMD ["node", ".output/server/index.mjs"] 