# Build
FROM image-registry.openshift-image-registry.svc:5000/openshift/nodejs:20-ubi9 AS build
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json* ./
RUN npm install
COPY frontend/ ./
RUN npm run build

# Serve
FROM image-registry.openshift-image-registry.svc:5000/openshift/nginx:1.26-ubi9
COPY --from=build /app/dist /opt/app-root/src
RUN printf 'ok\n' > /opt/app-root/src/health
EXPOSE 8080
CMD ["nginx", "-g", "daemon off;"]
