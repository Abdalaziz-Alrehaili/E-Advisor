# Use the official Node.js image
FROM node:20

# 1. Install Python, pip, and Virtual Environment tools
RUN apt-get update && apt-get install -y python3 python3-pip python3-venv

# 2. Create a secure Python environment and install the ML libraries
RUN python3 -m venv /opt/venv
ENV PATH="/opt/venv/bin:$PATH"
RUN pip install pandas scikit-learn joblib

# 3. Create the folder where our code will live inside Docker
WORKDIR /app

# 4. Copy the package.json first to install libraries
COPY package*.json ./
RUN npm install

# 5. Copy all our backend code into the container
COPY . .

# 6. Tell Docker our server runs on port 5000
EXPOSE 5000

# 7. The command to start our server
CMD ["node", "server.js"]