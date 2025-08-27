# api/models.py
from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    # Seus campos customizados
    bio = models.TextField(blank=True)
    profile_picture = models.ImageField(upload_to='profile_pics/', null=True, blank=True)

    # --- CORREÇÃO PARA O CONFLITO ---
    # Adicionamos os campos abaixo para resolver o erro de "clash"
    groups = models.ManyToManyField(
        'auth.Group',
        verbose_name='groups',
        blank=True,
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        related_name="api_user_set",  # Nome único para resolver o conflito
        related_query_name="user",
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        verbose_name='user permissions',
        blank=True,
        help_text='Specific permissions for this user.',
        related_name="api_user_permissions_set", # Nome único para resolver o conflito
        related_query_name="user",
    )

class Post(models.Model):
    # ... o resto do seu arquivo de modelos continua igual ...
    author = models.ForeignKey(User, related_name='posts', on_delete=models.CASCADE)
    content = models.TextField(max_length=280)
    created_at = models.DateTimeField(auto_now_add=True)
    likes = models.ManyToManyField(User, related_name='liked_posts', blank=True)

    def __str__(self):
        return f'Post by {self.author.username} at {self.created_at.strftime("%Y-%m-%d %H:%M")}'

class Follow(models.Model):
    # ... o resto do seu arquivo de modelos continua igual ...
    follower = models.ForeignKey(User, related_name='following', on_delete=models.CASCADE)
    followed = models.ForeignKey(User, related_name='followers', on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('follower', 'followed')

    def __str__(self):
        return f'{self.follower.username} follows {self.followed.username}'