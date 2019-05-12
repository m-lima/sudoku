FROM node

WORKDIR /web

COPY package.json /web
COPY package-lock.json /web
RUN npm install

COPY . /web

# Build
RUN npm run build
