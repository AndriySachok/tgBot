FROM node:latest
RUN mkdir /usr/src/app
WORKDIR /usr/src/app
RUN npm install -g @angular/cli
COPY . .
EXPOSE 80
CMD ng serve --host 0.0.0.0 --port 80

# FROM node:latest AS build
# WORKDIR /usr/src/app
# RUN npm install -g @angular/cli
# COPY . .
# RUN ng build

# FROM nginx:latest
# COPY --from=build /usr/src/app/dist /usr/share/nginx/html
# EXPOSE 80
# CMD ["nginx", "-g", "daemon off;"]