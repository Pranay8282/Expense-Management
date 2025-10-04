from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Expense, ApprovalStep, User
from .serializers import ExpenseSerializer, ApprovalActionSerializer
from .permissions import IsOwnerOrApprover, IsManagerOrAdmin

class ExpenseViewSet(viewsets.ModelViewSet):
    serializer_class = ExpenseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Expense.objects.filter(employee__company=user.company)
        if user.role == 'MANAGER':
            # Return expenses for their team members and expenses pending their approval
            team_member_ids = user.team_members.values_list('id', flat=True)
            return Expense.objects.filter(employee_id__in=team_member_ids) | \
                   Expense.objects.filter(approval_steps__approver=user, approval_steps__status='PENDING')
        # Employee
        return Expense.objects.filter(employee=user)

    def perform_create(self, serializer):
        expense = serializer.save(employee=self.request.user)
        # Create approval steps
        self.create_approval_flow(expense)

    def create_approval_flow(self, expense):
        employee = expense.employee
        step = 1
        # 1. Direct Manager
        if employee.manager and employee.manager.is_manager_approver:
            ApprovalStep.objects.create(expense=expense, approver=employee.manager, step_number=step)
            step += 1
        
        # 2. Admin as final approver
        admin_approvers = User.objects.filter(company=employee.company, role='ADMIN')
        for admin in admin_approvers:
            ApprovalStep.objects.create(expense=expense, approver=admin, step_number=step)
        
        # If no approvers, auto-approve (or handle as per company policy)
        if not ApprovalStep.objects.filter(expense=expense).exists():
            expense.status = 'APPROVED'
            expense.save()

    @action(detail=True, methods=['post'], permission_classes=[IsOwnerOrApprover])
    def approve(self, request, pk=None):
        return self.handle_approval_action(request, pk, 'APPROVED')

    @action(detail=True, methods=['post'], permission_classes=[IsOwnerOrApprover])
    def reject(self, request, pk=None):
        return self.handle_approval_action(request, pk, 'REJECTED')

    def handle_approval_action(self, request, pk, new_status):
        expense = self.get_object()
        user = request.user
        
        try:
            approval_step = ApprovalStep.objects.get(expense=expense, approver=user, status='PENDING')
        except ApprovalStep.DoesNotExist:
            return Response({'error': 'No pending approval for you on this expense.'}, status=status.HTTP_403_FORBIDDEN)

        approval_step.status = new_status
        approval_step.comments = request.data.get('comments', '')
        approval_step.acted_at = timezone.now()
        approval_step.save()

        if new_status == 'REJECTED':
            expense.status = 'REJECTED'
            expense.save()
            # Optional: Invalidate subsequent approval steps
            ApprovalStep.objects.filter(expense=expense, step_number__gt=approval_step.step_number).delete()
        else: # Approved
            # Check if this was the final approval
            next_step = ApprovalStep.objects.filter(expense=expense, status='PENDING').order_by('step_number').first()
            if not next_step:
                expense.status = 'APPROVED'
                expense.save()

        return Response(ExpenseSerializer(expense).data)

    @action(detail=False, methods=['get'], permission_classes=[IsManagerOrAdmin])
    def approval_queue(self, request):
        user = request.user
        pending_expenses = Expense.objects.filter(
            approval_steps__approver=user,
            approval_steps__status='PENDING'
        ).distinct()
        serializer = self.get_serializer(pending_expenses, many=True)
        return Response(serializer.data)
