from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response

from projects.models import Project
from tasks.models import Task
from workspaces.models import Workspace


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def dashboard_summary(request):
    workspaces = Workspace.objects.filter(memberships__user=request.user).count()
    projects = Project.objects.filter(workspace__memberships__user=request.user).count()
    tasks = Task.objects.filter(project__workspace__memberships__user=request.user).count()
    completed = Task.objects.filter(project__workspace__memberships__user=request.user, status='done').count()
    priorities = {
        'low': Task.objects.filter(project__workspace__memberships__user=request.user, priority='low').count(),
        'medium': Task.objects.filter(project__workspace__memberships__user=request.user, priority='medium').count(),
        'high': Task.objects.filter(project__workspace__memberships__user=request.user, priority='high').count(),
    }
    return Response({
        'workspaces': workspaces,
        'projects': projects,
        'tasks': tasks,
        'completed_tasks': completed,
        'priority_breakdown': priorities,
    })
