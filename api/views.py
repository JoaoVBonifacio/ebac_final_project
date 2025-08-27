# api/views.py
from rest_framework import generics, permissions
from rest_framework.response import Response
from .models import User, Post, Follow
from .serializers import UserRegisterSerializer, ProfileSerializer, PostSerializer

# View para registrar um novo usuário
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,) # Qualquer um pode se registrar
    serializer_class = UserRegisterSerializer

# View para ver e atualizar o próprio perfil
class ProfileView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = (permissions.IsAuthenticated,) # Apenas usuários logados

    def get_object(self):
        # Retorna o usuário que fez a requisição
        return self.request.user

# View para criar um post
class CreatePostView(generics.CreateAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        # Associa o post ao usuário logado
        serializer.save(author=self.request.user)

# View para ver o feed (posts de quem o usuário segue)
class FeedView(generics.ListAPIView):
    serializer_class = PostSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def get_queryset(self):
        # Pega a lista de IDs de usuários que eu sigo
        followed_users_ids = self.request.user.following.values_list('followed_id', flat=True)
        # Filtra os posts para mostrar apenas os desses usuários
        return Post.objects.filter(author_id__in=followed_users_ids).order_by('-created_at')