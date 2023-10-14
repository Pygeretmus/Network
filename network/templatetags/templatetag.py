from django import template

register = template.Library()

@register.filter(name="likes")
def like(value):
    return len(value.split(","))