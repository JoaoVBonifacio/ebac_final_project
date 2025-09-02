# Usa uma imagem oficial do Python como base
FROM python:3.11-slim

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Define variáveis de ambiente para o Python
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Copia o arquivo de dependências para o contêiner
COPY requirements.txt .

# Instala as dependências do projeto
RUN pip install --no-cache-dir -r requirements.txt

# Copia todo o resto do código do projeto para o contêiner
COPY . .

# Expõe a porta 8000 para que possamos nos conectar ao servidor Django
EXPOSE 8000

# O comando para iniciar a aplicação quando o contêiner rodar
# Inicia as migrações e depois o servidor Gunicorn
CMD ["sh", "-c", "python manage.py migrate && gunicorn backend.wsgi:application --bind 0.0.0.0:8000"]