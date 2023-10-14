import json
from django.contrib.auth import authenticate, login, logout
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.http import JsonResponse
from django.shortcuts import render
from django.urls import reverse
from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.core.paginator import Paginator
from .models import *


def index(request):
    return render(request, "network/index.html")


@csrf_exempt
@login_required
def save(request):
    id = json.loads(request.body).get("id")
    value = json.loads(request.body).get("value")
    post = Posts.objects.get(id=id)
    if request.user == post.owner:
        post.content = value.strip()
        post.save()
        return JsonResponse({"status": 200})
    return JsonResponse({"status": 404})


@csrf_exempt
def post(request):
    username = json.loads(request.body).get("username")
    id = json.loads(request.body).get("id")
    number = json.loads(request.body).get("number")
    result = {"username": None}
    try:
        if id == None:
            id = 9223372036854775807  # maximum integer value in Sqlite3
        if username == "false":
            following = [x.user for x in request.user.who_am_i_reading.all()]
            posts = [
                post.serialize()
                for post in Posts.objects.filter(owner__in=following)
                & Posts.objects.filter(id__lte=id)
            ]
            result = {"username": "false"}
        elif username in [None, "null"]:
            posts = [post.serialize() for post in Posts.objects.filter(id__lte=id)]
        else:
            user = User.objects.get(username=username)
            followers = Followers.objects.get(user=user).followers.all()
            posts = [
                post.serialize()
                for post in (Posts.objects.filter(owner=user) & Posts.objects.filter(id__lte=id))
            ]
            if user == request.user:
                result = {
                    "username": user.username,
                    "followers": len(followers),
                    "reading": len(user.who_am_i_reading.all()),
                    "followed": None,
                }
            else:
                result = {
                    "username": user.username,
                    "followers": len(followers),
                    "reading": len(user.who_am_i_reading.all()),
                    "followed": request.user in followers,
                }
        posts = sorted(posts, key=lambda post: post["id"], reverse=True)
        posts = Paginator(posts, 10)
        result = result | {
            "user": request.user.username,
            "number": number,
            "maximum": posts.num_pages,
            "id": posts.page(1).object_list[0]["id"],
        }
        return JsonResponse({"result": result, "posts": posts.page(number).object_list}, safe=False)
    except IndexError:
        return JsonResponse(
            {
                "result": result,
                "posts": [
                    {
                        "id": 92233720368,
                        "content": "Nothing here now",
                        "date": "Not forever",
                        "owner": "System",
                    }
                ],
            },
            safe=False,
        )


@csrf_exempt
@login_required
def create(request):
    if request.method == "POST":
        data = json.loads(request.body)
        content = data.get("content").strip()
        if len(content):
            post = Posts(content=content, owner=request.user)
            post.save()
            return JsonResponse({"status": 200})
        return JsonResponse({"status": 403})


@csrf_exempt
@login_required
def follow(request):
    if request.method == "PUT":
        user = request.user
        follow = Followers.objects.get(
            user=User.objects.get(username=json.loads(request.body).get("name"))
        ).followers
        if user in follow.all():
            follow.remove(user)
        else:
            follow.add(user)
        return JsonResponse({"status": 200})


@csrf_exempt
@login_required
def favorite(request):
    if request.method == "PUT":
        user = request.user
        post = Posts.objects.get(id=json.loads(request.body).get("id")).favorite
        if user.username in [x.username for x in post.all()]:
            post.remove(request.user)
        else:
            post.add(request.user)
        return JsonResponse({"status": 200})


@csrf_exempt
def favorites(request):
    if request.method == "POST":
        user = request.user
        posts = json.loads(request.body).get("post")
        result = {}
        for x in posts:
            result[x] = {}
            favorite = Posts.objects.get(id=x).favorite.all()
            result[x]["favorite"] = user.username in [x.username for x in favorite]
            result[x]["amount"] = len(favorite)
        return JsonResponse(result)


def login_view(request):
    if request.method == "POST":
        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(
                request, "network/login.html", {"message": "Invalid username and/or password."}
            )
    else:
        return render(request, "network/login.html")


def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))


def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        if not username:
            return render(request, "network/register.html", {"message": "Username is required."})

        email = request.POST["email"]
        if not email:
            return render(request, "network/register.html", {"message": "Email is required."})

        # Ensure password matches confirmation
        password = request.POST["password"]
        if not password:
            return render(request, "network/register.html", {"message": "Password is required."})

        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {"message": "Passwords must match."})
        if username in ["false", "null"]:
            return render(request, "network/register.html", {"message": "Wrong username."})

        if User.objects.filter(email=email).first():
            return render(request, "network/register.html", {"message": "Email already taken."})

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
            follower = Followers(user=user)
            follower.save()
        except IntegrityError:
            return render(request, "network/register.html", {"message": "Username already taken."})
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
