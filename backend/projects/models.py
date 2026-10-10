from django.conf import settings
from django.db import models

from workspaces.models import Workspace


class Project(models.Model):
    workspace = models.ForeignKey(Workspace, related_name='projects', on_delete=models.CASCADE)
    name = models.CharField(max_length=160)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.PROTECT, related_name='created_projects')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return self.name
