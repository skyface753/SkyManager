FROM node

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 80 443
CMD [ "node", "server.js" ]
# CMD ["sh", "-c", "/usr/src/app/entrypoint.sh ; node server.js"]
