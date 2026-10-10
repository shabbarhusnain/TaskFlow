from rest_framework import permissions, viewsets

from .models import Project
from .serializers import ProjectSerializer


class ProjectViewSet(viewsets.ModelViewSet):
    serializer_class = ProjectSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Project.objects.filter(workspace__memberships__user=self.request.user).distinct()

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
