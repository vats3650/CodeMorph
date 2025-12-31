# --- Build Stage ---
# Uses Node v18 (Stable) as the BASE IMAGE
FROM node:18-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of your application code
COPY . .

# Make sure the entrypoint script we created is executable
RUN chmod +x entrypoint.sh

# Expose port 8080 (Cloud Run's default)
EXPOSE 8080

# --- Runtime Configuration ---
# Instead of running npm start directly, we run our script first
# to generate the secure config file.
ENTRYPOINT ["./entrypoint.sh"]
