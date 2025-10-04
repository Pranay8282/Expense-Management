from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ExpenseViewSet, ApprovalFlowViewSet

router = DefaultRouter()
router.register('claims', ExpenseViewSet, basename='expense')
router.register('approval-flows', ApprovalFlowViewSet, basename='approval-flow')

urlpatterns = [
    path('', include(router.urls)),
]
