# ===============================
# Cloud Run - Backend Node ONLY
# ===============================

FROM node:20-slim

# Diretório de trabalho
WORKDIR /app

# -------------------------------
# Instalar dependências do backend
# -------------------------------
COPY backend/package*.json ./backend/
WORKDIR /app/backend
RUN npm ci

# -------------------------------
# Copiar código do backend
# -------------------------------
COPY backend/ /app/backend/

# -------------------------------
# Build TypeScript -> dist/
# -------------------------------
RUN npm run build

# -------------------------------
# Configuração Cloud Run
# -------------------------------
ENV NODE_ENV=production
ENV PORT=8080

EXPOSE 8080

# -------------------------------
# Start do backend (1 único processo)
# -------------------------------
CMD ["node", "dist/server.js"]
