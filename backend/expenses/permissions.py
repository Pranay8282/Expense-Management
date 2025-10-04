from rest_framework import permissions
from .models import ApprovalStep

class IsOwnerOrApprover(permissions.BasePermission):
    """
    Allows access only to the expense owner or a designated approver.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in permissions.SAFE_METHODS:
            # Check if user is owner, manager of owner, or an approver
            is_approver = ApprovalStep.objects.filter(expense=obj, approver=request.user).exists()
            return obj.employee == request.user or obj.employee.manager == request.user or is_approver or request.user.role == 'ADMIN'
        
        # Write permissions are only for designated approvers
        is_pending_approver = ApprovalStep.objects.filter(expense=obj, approver=request.user, status='PENDING').exists()
        return is_pending_approver

class IsManagerOrAdmin(permissions.BasePermission):
    """
    Allows access only to Managers or Admins.
    """
    def has_permission(self, request, view):
        return request.user and (request.user.role == 'MANAGER' or request.user.role == 'ADMIN')
