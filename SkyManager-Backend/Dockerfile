ARG ARCH=
FROM ${ARCH}node as dev
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY package*.json ./
RUN npm install
EXPOSE 80
CMD [ "npm", "run", "debug" ]

ARG ARCH=
FROM ${ARCH}node
# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
COPY package*.json ./
RUN npm install
# Bundle app source
COPY . .
EXPOSE 80 443
CMD [ "node", "server.js" ]