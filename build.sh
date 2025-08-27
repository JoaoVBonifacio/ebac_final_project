#!/bin/bash

# Instala todas as dependências
pip install -r requirements.txt

# Coleta os arquivos estáticos
python manage.py collectstatic --noinput

# Aplica as migrações do banco de dados
python manage.py migrate