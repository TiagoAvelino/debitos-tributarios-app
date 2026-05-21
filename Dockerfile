# Build
FROM image-registry.openshift-image-registry.svc:5000/openshift/nodejs:20-ubi9 AS build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Serve
FROM image-registry.openshift-image-registry.svc:5000/openshift/nginx:1.26-ubi9
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
