FROM node:20-alpine

# Define diretório de trabalho
WORKDIR /app

# Copia e instala dependências
COPY package*.json ./
RUN npm install

# Copia o restante do projeto
COPY . .

# Build do projeto (certifique-se que o script "build" existe no package.json)
RUN npm run build

# Garante que /tmp/certs existe e pertence ao usuário node
RUN mkdir -p /tmp/certs && chown -R node:node /tmp/certs

# Usa o usuário node por segurança
USER node

# Inicia a aplicação
CMD ["node", "dist/src/main.js"]
