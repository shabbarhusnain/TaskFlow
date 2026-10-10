from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from projects.models import Project
from tasks.models import Task
from workspaces.models import Workspace, WorkspaceMembership

User = get_user_model()


class TaskFlowApiTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(email='owner@example.com', username='owner', password='Password123!')
        self.other_user = User.objects.create_user(email='other@example.com', username='other', password='Password123!')
        self.workspace = Workspace.objects.create(name='Platform Team', description='Example', created_by=self.user)
        WorkspaceMembership.objects.create(workspace=self.workspace, user=self.user, role='owner')
        self.project = Project.objects.create(workspace=self.workspace, name='Launch plan', created_by=self.user)

    def test_register_and_auth_flow(self):
        response = self.client.post('/api/v1/auth/register/', {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'Password123!',
            'first_name': 'New',
            'last_name': 'User',
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        token_response = self.client.post('/api/v1/auth/token/', {
            'email': 'newuser@example.com',
            'password': 'Password123!',
        }, format='json')
        self.assertEqual(token_response.status_code, status.HTTP_200_OK)
        self.assertIn('access', token_response.data)

    def test_user_can_create_workspace_and_project(self):
        self.client.force_authenticate(user=self.user)
        workspace_response = self.client.post('/api/v1/workspaces/', {'name': 'Ops', 'description': 'Ops work'}, format='json')
        self.assertEqual(workspace_response.status_code, status.HTTP_201_CREATED)
        project_response = self.client.post('/api/v1/projects/', {'workspace': workspace_response.data['id'], 'name': 'Infrastructure'}, format='json')
        self.assertEqual(project_response.status_code, status.HTTP_201_CREATED)

    def test_task_assignment_requires_workspace_membership(self):
        self.client.force_authenticate(user=self.user)
        response = self.client.post('/api/v1/tasks/', {
            'project': self.project.id,
            'title': 'Prepare release',
            'description': 'Checklist',
            'status': 'in_progress',
            'priority': 'high',
            'assignee': self.other_user.id,
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_dashboard_summary_for_workspace_member(self):
        self.client.force_authenticate(user=self.user)
        Task.objects.create(project=self.project, title='Ship', description='Ship it', status='done', priority='high', created_by=self.user)
        response = self.client.get('/api/v1/dashboard/summary/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(response.data['tasks'], 1)
        self.assertEqual(response.data['completed_tasks'], 1)
