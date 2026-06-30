# ========== Stage 1: Build React frontend ==========
FROM node:20-alpine AS frontend-build
WORKDIR /app/front
COPY front/package.json front/package-lock.json* ./
RUN npm install
COPY front/ .
RUN npm run build

# ========== Stage 2: Backend + Frontend ==========
FROM node:20-alpine
WORKDIR /app

# Install backend dependencies
COPY back/package.json back/package-lock.json* ./back/
WORKDIR /app/back
RUN npm install --omit=dev

# Copy backend source
COPY back/ .

# Copy React build to the path backend expects (../front/build relative to back/)
RUN mkdir -p /app/front
COPY --from=frontend-build /app/front/build /app/front/build

# Seed images: copy to a backup location before volume mounts
RUN cp -r /app/back/public/upload /app/back/upload_seed

# Startup script: sync seed images to volume on first start
COPY back/init-volume.sh /app/init-volume.sh
RUN chmod +x /app/init-volume.sh

EXPOSE 3032
CMD ["/app/init-volume.sh"]
