# api/urls.py
from django.urls import path
from .views import RegisterView, ProfileView, CreatePostView, FeedView, FollowView, UserListView, ChangePasswordView

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('posts/create/', CreatePostView.as_view(), name='create-post'),
    path('feed/', FeedView.as_view(), name='feed'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/follow/', FollowView.as_view(), name='follow-unfollow-user'),
]