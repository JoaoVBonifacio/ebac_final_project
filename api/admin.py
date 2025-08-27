# backend/api/admin.py
from django.contrib import admin
from .models import User, Post, Follow

# Registra os modelos para que apareçam no painel de admin
admin.site.register(User)
admin.site.register(Post)
admin.site.register(Follow)