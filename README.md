# Commerce
A Twitter-like social network website for making posts and following users.


## Video review: https://www.youtube.com/watch?v=iNMH13fpdVU


## Getting started
<pre>
$ pip install -r requirements.txt
$ python manage.py runserver
<kbd>Ctrl</kbd>+<kbd>C</kbd> - to shut down the server. 
</pre> 

## Content
1. [Models](#Models)
    1. [User](#User)
    2. [Posts](#Posts)
    3. [Followers](#Followers)
2. [New post](#New-post)
3. [All posts](#All-posts)
4. [Profile page](#Profile-page)
5. [Following](#Following)
6. [Pagination](#Pagination) 
7. [Edit post](#Edit-post) 
8. [Like and unlike](#Like-and-unlike)


## **Models**

Here you will find a description of the models that are used.

## User

This model contains the **username**, his **email** and **hashed password**.
Used for registering, logging in, sending mails and reading them.

content = models.TextField(default="")
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="posts")
    date = models.DateTimeField(auto_now_add=True)
    favorite

## Posts

This model contains the **content** of the post, it's **owner**, date of posting and who **liked** it.
Used to work with posts.

## Followers

This model contains the **user** and his **followers**.
Used to work with following.

## **New post**

Users who are signed in able to write a new text-based post by filling in text into a text area and then clicking a button to submit the post.

## **All posts**

The “All Posts” link in the navigation bar take the user to a page where they can see all posts from all users, with the most recent posts first.

## **Profile page**

Clicking on a username load that user’s profile page. This page show the number of followers the user has, as well as the number of people that the user follows and all of the posts for that user, in reverse chronological order.

## **Following**

The “Following” link in the navigation bar take the user to a page where they see all posts made by users that the current user follows.

## **Pagination**

On any page that displays posts, posts displayed only 10 on a page. If there are more than ten posts, a “Next” button appear to take the user to the next page of posts. If not on the first page, a “Previous” button appear to take the user to the previous page of posts as well. Also there are "First" and "Last" buttons.

## **Edit Post**

Users able to click an “Edit” button or link on any of their own posts to edit that post.

## **Like and unlike**

Users able to click a button or link on any post to toggle whether or not they “like” that post.

## **Django Admin Interface**

To create a superuser account that can access Django’s admin interface:
<pre>$ python manage.py createsuperuser </pre>
Site superuser able to view, add, edit, and delete any listings, comments, and bids made on the site.
To open superuser's console:
<pre>http://127.0.0.1:8000/admin/</pre>
