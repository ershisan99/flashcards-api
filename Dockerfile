# Use the official Node.js LTS as a parent image
FROM node:lts-alpine

# Set the working directory in the Docker container
WORKDIR /usr/src/app

# Install pnpm
RUN npm install -g pnpm

# Copy package.json, pnpm-lock.yaml (or package-lock.json if you use it) to the Docker container
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the rest of your application's code into the Docker container
COPY . .

# Generate Prisma client
RUN npx prisma generate

# Build your NestJS application
RUN pnpm run build

ENV PORT 3333

# Expose the port the app runs on
EXPOSE 3333

# Command to run when starting the container
CMD ["node", "dist/main"]
