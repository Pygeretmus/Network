
from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),
    path("create", views.create, name="create"),
    path("follow", views.follow, name="follow"),
    path("favorite", views.favorite, name="favorite"),
    path("favorites", views.favorites, name="favorites"),
    path("post", views.post, name="post"),
    path("save", views.save, name="save"),
]
