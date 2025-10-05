# Use imagem oficial Node.js baseada em Debian (compatível com apt-get)
FROM node:18-bullseye

# Evita prompts interativos durante instalação
ENV DEBIAN_FRONTEND=noninteractive

# Instala dependências do sistema necessárias para Puppeteer e netcat
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
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
    chromium \
    && rm -rf /var/lib/apt/lists/*

# Define variáveis de ambiente para Puppeteer usar o Chromium do sistema
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    PUPPETEER_DISABLE_SANDBOX=true \
    PUPPETEER_SKIP_DOWNLOAD=true

# Define diretório de trabalho dentro do container
WORKDIR /app

# Copia arquivos de dependência para aproveitar cache do Docker
COPY package*.json ./

# Instala dependências Node.js usando npm ci (mais rápido e confiável)
RUN npm ci --prefer-offline --no-audit --progress=false

# Copia o restante do código da aplicação
COPY . .

# Expõe a porta que a aplicação vai usar
EXPOSE 3000

# Comando padrão para iniciar a aplicação (ajuste se necessário)
CMD ["sh", "./start.sh"]