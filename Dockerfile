FROM node:16-alpine as pintailer-web-build

COPY ./pintailer-web/package.json ./
COPY ./pintailer-web/package-lock.json ./

RUN npm set progress=false && npm config set depth 0 && npm cache clean --force
# RUN npm i npm@latest -g && npm i && mkdir /ng-app && cp -R ./node_modules ./ng-app
# RUN npm install -g @angular/cli@7.0.6

WORKDIR /ng-app
COPY ./pintailer-web .
# RUN ng build

FROM nginx:stable-alpine
COPY ./pintailer-web/nginx.conf /etc/nginx/nginx.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=pintailer-web-build /ng-app/dist/my-app /usr/share/nginx/html

RUN ls /usr/share/nginx/html
EXPOSE 80 443

CMD [ "nginx", "-g", "daemon off;" ]