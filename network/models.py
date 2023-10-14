from django.contrib.auth.models import AbstractUser
from django.db import models
import time


class User(AbstractUser):
    pass
    

class Posts(models.Model):
    content = models.TextField(default="")
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    date = models.DateTimeField(auto_now_add=True)
    favorite = models.ManyToManyField("User", related_name="my_likes")
    
    def serialize(self):
        return {
            "id": self.id,
            "content": self.content,
            "date": time.strftime('%d.%m.%Y %H:%M', time.localtime(self.date.timestamp())),
            "owner": self.owner.username,
            "favorite": len(self.favorite.all())
        }


class Followers(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="follower")
    followers = models.ManyToManyField("User", related_name="who_am_i_reading")