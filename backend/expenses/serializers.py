from rest_framework import serializers
from .models import Expense, ApprovalStep, ApprovalFlow, ApprovalFlowStep
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

# --- Add the following new serializers ---

class ApprovalFlowStepSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApprovalFlowStep
        fields = ['id', 'step_number', 'approver_role']

class ApprovalFlowSerializer(serializers.ModelSerializer):
    steps = ApprovalFlowStepSerializer(many=True)

    class Meta:
        model = ApprovalFlow
        fields = ['id', 'name', 'is_default', 'steps', 'company']
        read_only_fields = ['company']

    def create(self, validated_data):
        steps_data = validated_data.pop('steps')
        request = self.context.get("request")
        company = request.user.company
        
        # Ensure only one default flow per company
        if validated_data.get('is_default', False):
            ApprovalFlow.objects.filter(company=company, is_default=True).update(is_default=False)
        
        approval_flow = ApprovalFlow.objects.create(company=company, **validated_data)
        for step_data in steps_data:
            ApprovalFlowStep.objects.create(approval_flow=approval_flow, **step_data)
        return approval_flow
