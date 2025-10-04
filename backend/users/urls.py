from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterView, MyTokenObtainPairView, UserProfileView, UserViewSet
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register('manage', UserViewSet, basename='user-manage')

urlpatterns = [
    path('register/', RegisterView.as_view(), name='auth_register'),
    path('login/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('login/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('profile/', UserProfileView.as_view(), name='user_profile'),
    path('', include(router.urls)),
]
