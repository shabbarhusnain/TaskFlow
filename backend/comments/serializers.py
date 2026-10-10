from rest_framework import serializers

from .models import Comment


class CommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ('id', 'task', 'author', 'body', 'created_at')
        read_only_fields = ('id', 'author', 'created_at')
