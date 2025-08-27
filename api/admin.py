# backend/api/admin.py
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, Post, Follow

# Crie uma classe de Admin customizada que herda de UserAdmin
class CustomUserAdmin(UserAdmin):
    # Campos a serem exibidos na lista de usuários
    list_display = ('username', 'email', 'first_name', 'last_name', 'is_staff')

    # Campos a serem usados no formulário de EDIÇÃO de um usuário
    # Pegamos os campos padrão e adicionamos os nossos
    fieldsets = UserAdmin.fieldsets + (
        ('Campos Personalizados', {'fields': ('bio', 'profile_picture')}),
    )

    # Campos a serem usados no formulário de CRIAÇÃO de um novo usuário
    # Pegamos os campos padrão de criação e adicionamos o email
    add_fieldsets = UserAdmin.add_fieldsets + (
        (None, {'fields': ('email',)}),
    )

# Registra o nosso modelo User usando a nossa classe CustomUserAdmin
admin.site.register(User, CustomUserAdmin)

# Registra os outros modelos normalmente
admin.site.register(Post)
admin.site.register(Follow)