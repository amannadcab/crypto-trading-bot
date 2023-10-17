FROM node:16


# Install build-essential, sqlite in order
# RUN  apt install -y sqlite

WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install --production && \
    npm cache clean --force

# Bundle app source
COPY . /usr/src/app

# Apply all patches in app
RUN npm run postinstall

EXPOSE 8080
CMD ["npm", "run", "start"]
