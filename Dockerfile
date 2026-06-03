# FROM node:20-alpine

# WORKDIR /app

# COPY package.json .
# RUN npm install

# COPY . .

# EXPOSE 5173

# CMD ["npm", "run", "dev"]


# Step 1 build react app
FROM node:20 as build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Vite embeds VITE_* at build time (runtime env in compose does not change the bundle)
ARG VITE_API_URL=http://localhost:8000
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# Step 2 serve using nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80