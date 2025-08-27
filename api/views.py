# api/views.py
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import User, Post, Follow
from .serializers import UserRegisterSerializer, ProfileSerializer, PostSerializer, ChangePasswordSerializer

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
    
class ChangePasswordView(generics.UpdateAPIView):
    serializer_class = ChangePasswordSerializer
    model = User
    permission_classes = (permissions.IsAuthenticated,)

    def get_object(self, queryset=None):
        return self.request.user

    def update(self, request, *args, **kwargs):
        self.object = self.get_object()
        serializer = self.get_serializer(data=request.data)

        if serializer.is_valid():
            # Verifica a senha antiga
            if not self.object.check_password(serializer.data.get("old_password")):
                return Response({"old_password": ["Senha incorreta."]}, status=status.HTTP_400_BAD_REQUEST)
            # Define a nova senha
            self.object.set_password(serializer.data.get("new_password"))
            self.object.save()
            return Response({"status": "senha alterada com sucesso"}, status=status.HTTP_200_OK)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class FollowView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, pk):
        try:
            user_to_follow = User.objects.get(pk=pk)
            if user_to_follow == request.user:
                return Response({"error": "Você não pode seguir a si mesmo."}, status=status.HTTP_400_BAD_REQUEST)

            # Cria a relação, ou ignora se já existir
            Follow.objects.get_or_create(follower=request.user, followed=user_to_follow)
            return Response({"status": "seguindo"}, status=status.HTTP_201_CREATED)
        except User.DoesNotExist:
            return Response({"error": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND)
    
    def delete(self, request, pk):
        try:
            user_to_unfollow = User.objects.get(pk=pk)
            # Encontra a relação de "seguir"
            relation = Follow.objects.filter(follower=request.user, followed=user_to_unfollow)
            if relation.exists():
                relation.delete()
                return Response({"status": "deixou de seguir"}, status=status.HTTP_200_OK)
            else:
                return Response({"error": "Você não está seguindo este usuário."}, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({"error": "Usuário não encontrado."}, status=status.HTTP_404_NOT_FOUND)

class UserListView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = ProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Exclui o usuário logado da lista para ele não se seguir
        return User.objects.exclude(pk=self.request.user.pk)    