FROM node:10

# Setting working directory. All the path will be relative to WORKDIR
WORKDIR /usr/src/app

# Installing dependencies
COPY package*.json ./
RUN npm install

# Copying source files
COPY . .

ENV SERVER_URL=http://localhost:4000
ENV MYSQL_DATABASE=maintenance_dev

# Building app
RUN npm run build

# Expose default port
EXPOSE 4000

# Running the app
CMD [ "npm", "start" ]
