FROM node:10.16.0-stretch
COPY . .
RUN npm i
CMD node .
