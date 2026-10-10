from rest_framework import permissions, viewsets

from .models import Task
from .serializers import TaskSerializer


class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Task.objects.filter(project__workspace__memberships__user=self.request.user).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
