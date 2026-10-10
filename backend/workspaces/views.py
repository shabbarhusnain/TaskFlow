from rest_framework import permissions, viewsets

from .models import Workspace, WorkspaceMembership
from .serializers import WorkspaceSerializer


class WorkspaceViewSet(viewsets.ModelViewSet):
    serializer_class = WorkspaceSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Workspace.objects.filter(memberships__user=self.request.user).distinct()

    def perform_create(self, serializer):
        workspace = serializer.save(created_by=self.request.user)
        WorkspaceMembership.objects.create(workspace=workspace, user=self.request.user, role='owner')
