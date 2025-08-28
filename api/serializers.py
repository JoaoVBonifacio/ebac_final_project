# api/serializers.py
from rest_framework import serializers
from .models import User, Post

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

class PostSerializer(serializers.ModelSerializer):
    author = ProfileSerializer(read_only=True) # Mostra os dados do autor

    class Meta:
        model = Post
        fields = ['id', 'author', 'content', 'created_at', 'likes']
        
class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)