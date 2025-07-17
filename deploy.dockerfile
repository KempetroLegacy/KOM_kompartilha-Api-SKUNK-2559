# Use an official Node.js runtime as a parent image
FROM node:22-alpine AS builder

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json (or yarn.lock)
COPY package*.json ./

# Install project dependencies
RUN npm install
# If you are using yarn, use:
# RUN yarn install

# Copy the rest of the application code
COPY . .

# If your application needs a build step (e.g., TypeScript compilation)
# RUN npm run build

# Production image
FROM node:22-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/package*.json ./
# If you have a build step, copy the build output
# COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app .

# Expose the port the app runs on
# The .env file shows PORT=3001
EXPOSE 3001

# Define the command to run the application
# This might need to be adjusted based on your package.json scripts
CMD [ "npm", "start" ]