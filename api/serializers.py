# api/serializers.py
from rest_framework import serializers
from .models import User, Post, Comment

class UserRegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['username', 'email', 'password']
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        # Cria o usuário com a senha criptografada
        user = User.objects.create_user(**validated_data)
        return user

class ProfileSerializer(serializers.ModelSerializer):
    following = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'bio', 'profile_picture', 'following']

    def get_following(self, obj):
        return [follow.followed.id for follow in obj.following.all()]

class CommentSerializer(serializers.ModelSerializer):
    author = ProfileSerializer(read_only=True)

    class Meta:
        model = Comment
        fields = ['id', 'author', 'content', 'created_at']

class PostSerializer(serializers.ModelSerializer):
    author = ProfileSerializer(read_only=True)
    likes_count = serializers.SerializerMethodField()
    user_has_liked = serializers.SerializerMethodField()
    comments_count = serializers.SerializerMethodField()

    class Meta:
        model = Post
        # E os adicionamos à lista de campos
        fields = ['id', 'author', 'content', 'created_at', 'likes_count', 'user_has_liked', 'comments_count']
    
    # Este método calcula o total de curtidas
    def get_likes_count(self, obj):
        return obj.likes.count()

    # Este método verifica se o usuário da requisição já curtiu o post
    def get_user_has_liked(self, obj):
        user = self.context['request'].user
        return obj.likes.filter(pk=user.pk).exists()
    
    def get_comments_count(self, obj):
        return obj.comments.count()
        
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)