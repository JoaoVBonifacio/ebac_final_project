# Usa uma imagem oficial do Nginx como base
FROM nginx:alpine

# Copia os arquivos estáticos do seu frontend para a pasta que o Nginx serve por padrão
COPY . /usr/share/nginx/html

# Expõe a porta 80, que é a porta padrão do Nginx
EXPOSE 80

# O comando para iniciar o Nginx
CMD ["nginx", "-g", "daemon off;"]