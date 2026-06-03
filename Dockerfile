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
RUN npm run build

# Step 2 serve using nginx
FROM nginx:alpine

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80