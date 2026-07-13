# ========== Stage 1: Build React frontend ==========
FROM node:20-alpine AS frontend-build
ARG VITE_BASE_URL=/
WORKDIR /app/front
COPY front/package.json front/package-lock.json* ./
RUN npm install
COPY front/ .
RUN VITE_BASE_URL=${VITE_BASE_URL} npm run build

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

EXPOSE 3032
CMD ["node", "index.js"]
