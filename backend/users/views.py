from rest_framework import generics, permissions, viewsets
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import RegisterSerializer, UserSerializer, UserCreateSerializer
from .models import User
from .permissions import IsAdminOrReadOnly

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (permissions.AllowAny,)
    serializer_class = RegisterSerializer

class MyTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs) 
        user = User.objects.get(username=request.data['username'])
        response.data['user'] = UserSerializer(user).data
        return response 

class UserProfileView(generics.RetrieveUpdateAPIView): 
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self): 
        return self.request.user

class UserViewSet(viewsets.ModelViewSet): 
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsAdminOrReadOnly]

    def get_queryset(self):  
        user = self.request.user
        if user.is_staff or user.role == 'ADMIN': 
            return User.objects.filter(company=user.company)
        return User.objects.none() 

    def get_serializer_class(self): 
        if self.action in ['create', 'update', 'partial_update']:
            return UserCreateSerializer 
        return UserSerializer

    def perform_update(self, serializer): 
        user = serializer.save()
        password = self.request.data.get('password') 
        if password:
            user.set_password(password) 
            user.save() 
