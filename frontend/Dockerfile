FROM node:20-alpine

WORKDIR /app

# Install dependencies
COPY package.json ./
RUN npm install

# Copy source
COPY . .

# Expose port
EXPOSE 3000

# Dev mode
CMD ["npm", "run", "dev"]
