# Use Node LTS for build stage
FROM node:18-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package.json package-lock.json ./
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build the application for production
RUN npm run build

# Production image
FROM node:18-alpine AS runner
WORKDIR /app

# Install a lightweight static server
RUN npm install -g serve

# Copy built assets from builder stage
COPY --from=builder /app/dist ./dist

# Expose port for the server
EXPOSE 4173

# Start the server
CMD ["serve", "-s", "dist", "-l", "4173"]
