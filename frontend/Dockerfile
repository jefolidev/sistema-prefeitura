# Use imagem oficial do Node.js para build
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# Use uma imagem leve do Nginx para servir os arquivos estáticos
FROM nginx:alpine

# Copie o build do Vite para o diretório padrão do Nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copie um arquivo de configuração customizado do nginx, se necessário
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]