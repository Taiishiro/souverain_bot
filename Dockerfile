# Dockerfile pour Bot Souverain sur Hugging Face Spaces
FROM node:20-bookworm

# Définir le répertoire de travail
WORKDIR /app

# Mettre à jour apt et installer les dépendances système nécessaires pour Puppeteer
RUN apt-get update && apt-get install -y \
    chromium-browser \
    libnss3 \
    libxss1 \
    libappindicator1 \
    libindicator7 \
    libgconf-2-4 \
    libxkbcommon0 \
    libatk-bridge2.0-0 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxkbcommon-x11-0 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libdbus-1-3 \
    libglib2.0-0 \
    libharfbuzz0b \
    libgssapi-krb5-2 \
    libexpat1 \
    ca-certificates \
    fonts-dejavu \
    fonts-liberation \
    && rm -rf /var/lib/apt/lists/*

# Copier package.json et package-lock.json (s'il existe)
COPY package*.json ./

# Installer les dépendances npm
RUN npm install --production=false

# Générer les fichiers Prisma
RUN npx prisma generate

# Copier le reste du projet
COPY . .

# Compiler le TypeScript
RUN npm run build

# Exposer le port requis par Hugging Face Spaces
EXPOSE 7860

# Définir la variable d'environnement pour Puppeteer
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Commande de démarrage
CMD ["node", "dist/main.js"]
