from rest_framework.routers import DefaultRouter

from .views import CommentViewSet

router = DefaultRouter()
router.register(r'tasks/(?P<task_id>\d+)/comments', CommentViewSet, basename='task-comment')

urlpatterns = router.urls
