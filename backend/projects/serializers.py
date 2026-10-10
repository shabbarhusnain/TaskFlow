from django.core.exceptions import ValidationError
from rest_framework import serializers

from .models import Project


class ProjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Project
        fields = ('id', 'workspace', 'name', 'description', 'created_by', 'created_at')
        read_only_fields = ('id', 'created_by', 'created_at')

    def validate_workspace(self, value):
        user = self.context['request'].user
        if not value.memberships.filter(user=user).exists():
            raise serializers.ValidationError('You must belong to this workspace to create a project.')
        return value

    def create(self, validated_data):
        return Project.objects.create(**validated_data)
