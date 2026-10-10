from rest_framework import serializers

from .models import Workspace, WorkspaceMembership


class WorkspaceMembershipSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()

    class Meta:
        model = WorkspaceMembership
        fields = ('id', 'user', 'username', 'role', 'joined_at')
        read_only_fields = ('id', 'user', 'username', 'joined_at')

    def get_username(self, obj):
        return obj.user.username


class WorkspaceSerializer(serializers.ModelSerializer):
    members = WorkspaceMembershipSerializer(source='memberships', many=True, read_only=True)

    class Meta:
        model = Workspace
        fields = ('id', 'name', 'description', 'created_by', 'created_at', 'members')
        read_only_fields = ('id', 'created_by', 'created_at', 'members')
