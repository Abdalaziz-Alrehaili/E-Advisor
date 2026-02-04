# Use the official Node.js image
FROM node:20

# Create the folder where our code will live inside Docker
WORKDIR /app

# Copy the package.json first to install libraries
COPY package*.json ./
RUN npm install

# Copy all our backend code into the container
COPY . .

# Tell Docker our server runs on port 5000
EXPOSE 5000

# The command to start our server
CMD ["node", "server.js"]