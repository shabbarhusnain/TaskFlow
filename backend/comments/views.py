from django.shortcuts import get_object_or_404
from rest_framework import permissions, viewsets

from tasks.models import Task

from .models import Comment
from .serializers import CommentSerializer


class CommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        task_id = self.kwargs.get('task_id')
        return Comment.objects.filter(task_id=task_id, task__project__workspace__memberships__user=self.request.user).distinct()

    def perform_create(self, serializer):
        task = get_object_or_404(
            Task.objects.filter(project__workspace__memberships__user=self.request.user).distinct(),
            pk=self.kwargs['task_id'],
        )
        serializer.save(task=task, author=self.request.user)
