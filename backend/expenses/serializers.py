from rest_framework import serializers
from .models import Expense, ApprovalStep
from users.serializers import UserSerializer

class ApprovalStepSerializer(serializers.ModelSerializer):
    approver = UserSerializer(read_only=True)

    class Meta:
        model = ApprovalStep
        fields = ['id', 'approver', 'step_number', 'status', 'comments', 'acted_at']

class ExpenseSerializer(serializers.ModelSerializer):
    employee = UserSerializer(read_only=True)
    approval_steps = ApprovalStepSerializer(many=True, read_only=True)

    class Meta:
        model = Expense
        fields = [
            'id', 'employee', 'amount', 'currency', 'converted_amount', 'category',
            'description', 'date', 'receipt_image', 'status', 'created_at', 'approval_steps'
        ]
        read_only_fields = ['status', 'employee', 'converted_amount']

class ApprovalActionSerializer(serializers.Serializer):
    action = serializers.ChoiceField(choices=["approve", "reject"])
    comments = serializers.CharField(required=False, allow_blank=True)
