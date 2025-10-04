from rest_framework import serializers
from .models import User, Company

class CompanySerializer(serializers.ModelSerializer):
    class Meta:
        model = Company
        fields = ['id', 'name', 'country', 'currency']
        
class UserSerializer(serializers.ModelSerializer): 
    company = CompanySerializer(read_only=True) 
    manager = serializers.StringRelatedField()
 
    class Meta: 
        model = User 
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'role', 'company', 'manager', 'is_manager_approver']
 
class RegisterSerializer(serializers.ModelSerializer): 
    company_name = serializers.CharField(write_only=True, required=True)  
    country = serializers.CharField(write_only=True, required=True)
    currency = serializers.CharField(write_only=True, required=True) 

    class Meta:
        model = User 
        fields = ('id', 'username', 'password', 'email', 'first_name', 'last_name', 'company_name', 'country', 'currency')
        extra_kwargs = {'password': {'write_only': True}} 

    def create(self, validated_data): 
        company = Company.objects.create(
            name=validated_data['company_name'],
            country=validated_data['country'],  
            currency=validated_data['currency'] 
        )
        user = User.objects.create_user(
            username=validated_data['username'], 
            password=validated_data['password'], 
            email=validated_data['email'], 
            first_name=validated_data['first_name'], 
            last_name=validated_data['last_name'], 
            role='ADMIN', 
            company=company 
        )
        return user 

class UserCreateSerializer(serializers.ModelSerializer): 
    class Meta:
        model = User
        fields = ('username', 'password', 'email', 'first_name', 'last_name', 'role', 'manager', 'is_manager_approver')
        extra_kwargs = {'password': {'write_only': True}} 
  
    def create(self, validated_data): 
        # Assumes the request user is an admin and sets the company
        request_user = self.context['request'].user
        user = User.objects.create_user(
            company=request_user.company,
            **validated_data
        )
        return user
