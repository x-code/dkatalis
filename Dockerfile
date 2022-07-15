FROM node:12.13.1
COPY . /
RUN npm install
CMD ["npm", "start"]