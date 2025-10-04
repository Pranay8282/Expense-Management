from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Expense, ApprovalStep, User, ApprovalFlow
from .serializers import ExpenseSerializer, ApprovalActionSerializer, ApprovalFlowSerializer
from .permissions import IsOwnerOrApprover, IsManagerOrAdmin
import requests
import decimal

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
            team_expenses = Expense.objects.filter(employee_id__in=team_member_ids)
            pending_approval = Expense.objects.filter(approval_steps__approver=user, approval_steps__status='PENDING')
            return (team_expenses | pending_approval).distinct()
        # Employee
        return Expense.objects.filter(employee=user)

    def perform_create(self, serializer):
        user = self.request.user
        company = user.company
        amount = serializer.validated_data.get('amount')
        currency = serializer.validated_data.get('currency')
        
        converted_amount = amount
        if currency != company.currency:
            try:
                # NOTE: Using a free API key. In production, use a paid, reliable service.
                response = requests.get(f'https://api.exchangerate-api.com/v4/latest/{currency}')
                response.raise_for_status()
                rates = response.json().get('rates', {})
                conversion_rate = rates.get(company.currency)
                if conversion_rate:
                    converted_amount = amount * decimal.Decimal(conversion_rate)
                else:
                    # Handle case where conversion rate is not available
                    pass
            except requests.RequestException as e:
                # Handle API errors gracefully
                print(f"Could not fetch conversion rate: {e}")

        expense = serializer.save(employee=user, converted_amount=converted_amount)
        self.create_approval_flow(expense)

    def create_approval_flow(self, expense):
        employee = expense.employee
        company = employee.company
        
        # Find the default approval flow for the company
        default_flow = ApprovalFlow.objects.filter(company=company, is_default=True).first()

        if not default_flow:
            # Fallback to simple Manager -> Admin flow if no default is set
            step = 1
            manager_is_approver = False
            if employee.manager and employee.manager.is_manager_approver:
                ApprovalStep.objects.create(expense=expense, approver=employee.manager, step_number=step)
                step += 1
                manager_is_approver = True

            admin = User.objects.filter(company=company, role='ADMIN').first()
            if admin:
                if not (manager_is_approver and employee.manager == admin):
                    ApprovalStep.objects.create(expense=expense, approver=admin, step_number=step)
            return

        expense.approval_flow_history = default_flow
        expense.save()

        for flow_step in default_flow.steps.all():
            approver = None
            if flow_step.approver_role == 'MANAGER':
                if employee.manager and employee.manager.is_manager_approver:
                    approver = employee.manager
            elif flow_step.approver_role == 'ADMIN':
                approver = User.objects.filter(company=company, role='ADMIN').first()
            
            if approver:
                # Prevent creating duplicate approval steps for the same person
                if not ApprovalStep.objects.filter(expense=expense, approver=approver).exists():
                    ApprovalStep.objects.create(
                        expense=expense,
                        approver=approver,
                        step_number=flow_step.step_number
                    )

    @action(detail=True, methods=['post'], permission_classes=[IsOwnerOrApprover])
    def approve(self, request, pk=None):
        return self.handle_approval_action(request, pk, 'APPROVED')

    @action(detail=True, methods=['post'], permission_classes=[IsOwnerOrApprover])
    def reject(self, request, pk=None):
        return self.handle_approval_action(request, pk, 'REJECTED')

    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAdminUser])
    def override_status(self, request, pk=None):
        expense = self.get_object()
        new_status = request.data.get('status')
        if new_status not in ['APPROVED', 'REJECTED']:
            return Response({'error': 'Invalid status provided.'}, status=status.HTTP_400_BAD_REQUEST)
        
        expense.status = new_status
        expense.save()
        
        # Optional: Add a comment or log this override action
        return Response(ExpenseSerializer(expense).data)

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

class ApprovalFlowViewSet(viewsets.ModelViewSet):
    serializer_class = ApprovalFlowSerializer
    permission_classes = [permissions.IsAuthenticated] # Should be IsAdmin

    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return ApprovalFlow.objects.filter(company=user.company)
        return ApprovalFlow.objects.none()

    def perform_create(self, serializer):
        serializer.save(company=self.request.user.company)
