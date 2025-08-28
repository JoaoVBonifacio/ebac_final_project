# api/urls.py
from django.urls import path
from .views import RegisterView, ProfileView, CreatePostView, FeedView, FollowView, UserListView, ChangePasswordView, FollowingListView, FollowersListView, LikePostView, PostCommentView
urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('posts/create/', CreatePostView.as_view(), name='create-post'),
    path('feed/', FeedView.as_view(), name='feed'),
    path('profile/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('users/', UserListView.as_view(), name='user-list'),
    path('users/<int:pk>/follow/', FollowView.as_view(), name='follow-unfollow-user'),
    path('profile/following/', FollowingListView.as_view(), name='following-list'),
    path('profile/followers/', FollowersListView.as_view(), name='followers-list'),
    path('posts/<int:pk>/like/', LikePostView.as_view(), name='like-post'),
    path('posts/<int:pk>/comments/', PostCommentView.as_view(), name='post-comments'),
]