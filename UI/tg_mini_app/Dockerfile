FROM node:20.9.0 as build
COPY . .
RUN npm cache clean --force
RUN npm install
RUN npm run build

FROM nginx:latest
COPY --from=build /app/dist/* /usr/share/nginx/html/
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]