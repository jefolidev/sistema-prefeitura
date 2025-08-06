# Use uma imagem oficial do Node.js baseada em Debian (com apt-get)
FROM node:20-slim

# Evita prompts interativos
ENV DEBIAN_FRONTEND=noninteractive

# Instale dependências necessárias para o Chromium (usado pelo Puppeteer) e netcat (nc)
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcups2 \
    libdbus-1-3 \
    libgdk-pixbuf2.0-0 \
    libnspr4 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    libu2f-udev \
    libvulkan1 \
    && rm -rf /var/lib/apt/lists/*

# Define variáveis de ambiente para Puppeteer usar o Chromium do sistema
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PUPPETEER_DISABLE_SANDBOX=true

# Define o diretório de trabalho
WORKDIR /app

# Copie os arquivos de dependências
COPY package*.json ./

# Instale as dependências do Node.js
RUN npm install

# Copie o restante do código da aplicação
COPY . .

# Exponha a porta usada pela aplicação
EXPOSE 3000

# Use o script start.sh para iniciar o container
CMD ["sh", "./start.sh"]

