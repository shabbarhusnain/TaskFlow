from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/auth/', include('accounts.urls')),
    path('api/v1/', include('workspaces.urls')),
    path('api/v1/', include('projects.urls')),
    path('api/v1/', include('tasks.urls')),
    path('api/v1/', include('comments.urls')),
    path('api/v1/', include('core.urls')),
]
