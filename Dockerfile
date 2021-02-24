FROM node:14

ENV PORT 3000

# installing Postgresql client
RUN apt-get update && \
    apt-get install -y postgresql-client

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json /usr/src/app/
RUN npm install

# Copying source files
COPY . /usr/src/app


EXPOSE 3000

# Running the app
CMD [ "npm", "start"]
