# api/urls.py
from django.urls import path
from .views import RegisterView, ProfileView, CreatePostView, FeedView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('posts/create/', CreatePostView.as_view(), name='create-post'),
    path('feed/', FeedView.as_view(), name='feed'),
]