from rest_framework import serializers

from .models import Task


class TaskSerializer(serializers.ModelSerializer):
    assignee = serializers.PrimaryKeyRelatedField(read_only=False, queryset=__import__('django.contrib.auth').contrib.auth.get_user_model().objects.all(), required=False, allow_null=True)

    class Meta:
        model = Task
        fields = ('id', 'project', 'title', 'description', 'status', 'priority', 'assignee', 'due_date', 'created_by', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_by', 'created_at', 'updated_at')

    def validate_assignee(self, value):
        project = self.initial_data.get('project')
        if value and project:
            project_obj = __import__('projects.models').models.Project.objects.filter(pk=project).first()
            if project_obj and not project_obj.workspace.memberships.filter(user=value).exists():
                raise serializers.ValidationError('The assignee must be a member of the same workspace.')
        return value

    def validate(self, attrs):
        assignee = attrs.get('assignee')
        project = attrs.get('project')
        if assignee and project and not project.workspace.memberships.filter(user=assignee).exists():
            raise serializers.ValidationError('The assignee must belong to the project workspace.')
        return attrs
