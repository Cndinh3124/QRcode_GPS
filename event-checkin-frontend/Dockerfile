# Giai doan 1: cai package va build giao dien React.
FROM node:22-alpine AS build
WORKDIR /app

# Dia chi API duoc truyen vao luc build image.
ARG VITE_API_URL=/api
ENV VITE_API_URL=${VITE_API_URL}
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# Giai doan 2: Nginx phuc vu cac tep giao dien da build.
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
