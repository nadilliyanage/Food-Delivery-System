# Use official Node.js image
FROM node:18-alpine

# Set working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install --omit=dev

# Copy the entire application code
COPY . .

# Expose the port the service runs on
EXPOSE 3003

# Start the application
CMD ["npm", "start"]
