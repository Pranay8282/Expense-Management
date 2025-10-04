from django.contrib.auth.models import AbstractUser
from django.db import models

class Company(models.Model):
    name = models.CharField(max_length=255)
    country = models.CharField(max_length=100)
    currency = models.CharField(max_length=10)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class User(AbstractUser):
    ROLE_CHOICES = [ 
        ('ADMIN', 'Admin'), 
        ('MANAGER', 'Manager'), 
        ('EMPLOYEE', 'Employee'), 
    ]
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='EMPLOYEE')
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="users", null=True, blank=True)
    manager = models.ForeignKey("self", on_delete=models.SET_NULL, null=True, blank=True, related_name="team_members")
    is_manager_approver = models.BooleanField(default=False) 

    # Add related_name to avoid clashes with default User model
    groups = models.ManyToManyField( 
        'auth.Group', 
        related_name='custom_user_set', 
        blank=True,  
        help_text='The groups this user belongs to. A user will get all permissions granted to each of their groups.',
        verbose_name='groups', 
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='custom_user_set',
        blank=True,
        help_text='Specific permissions for this user.',
        verbose_name='user permissions',   
    )
