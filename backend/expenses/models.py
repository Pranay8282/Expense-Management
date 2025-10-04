from django.db import models
from users.models import User, Company

class Expense(models.Model):
    STATUS_CHOICES = [("PENDING","Pending"), ("APPROVED","Approved"), ("REJECTED","Rejected")]
    
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name="expenses")
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    currency = models.CharField(max_length=10)
    converted_amount = models.DecimalField(max_digits=12, decimal_places=2)
    category = models.CharField(max_length=100)
    description = models.TextField()
    date = models.DateField()
    receipt_image = models.ImageField(upload_to="receipts/", null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    created_at = models.DateTimeField(auto_now_add=True)
    approval_flow_history = models.ForeignKey('ApprovalFlow', on_delete=models.SET_NULL, null=True, blank=True, related_name="expenses_history")

    def __str__(self):
        return f"{self.description} - {self.employee.username}"


class ApprovalStep(models.Model):
    STATUS_CHOICES = [("PENDING","Pending"), ("APPROVED","Approved"), ("REJECTED","Rejected")]

    expense = models.ForeignKey(Expense, on_delete=models.CASCADE, related_name="approval_steps")
    approver = models.ForeignKey(User, on_delete=models.CASCADE, related_name="approvals")
    step_number = models.IntegerField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING")
    comments = models.TextField(null=True, blank=True)
    acted_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ['step_number']

class ApprovalRule(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="approval_rules")
    name = models.CharField(max_length=255)
    percentage_required = models.IntegerField(null=True, blank=True)
    specific_approver = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name="special_rules")
    hybrid = models.BooleanField(default=False)

class OCRRecord(models.Model):
    expense = models.OneToOneField(Expense, on_delete=models.CASCADE, related_name="ocr_data")
    raw_text = models.TextField()
    extracted_amount = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True)
    extracted_date = models.DateField(null=True, blank=True)
    extracted_description = models.CharField(max_length=255, null=True, blank=True)

# --- Add the following new models ---

class ApprovalFlow(models.Model):
    company = models.ForeignKey(Company, on_delete=models.CASCADE, related_name="approval_flows")
    name = models.CharField(max_length=255)
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class ApprovalFlowStep(models.Model):
    ROLE_CHOICES = [
        ('MANAGER', 'Manager'),
        ('ADMIN', 'Admin'),
    ]
    approval_flow = models.ForeignKey(ApprovalFlow, on_delete=models.CASCADE, related_name="steps")
    step_number = models.IntegerField()
    approver_role = models.CharField(max_length=20, choices=ROLE_CHOICES)
        
    class Meta:
        ordering = ['step_number']

    def __str__(self):
        return f"Step {self.step_number}: {self.approver_role} for {self.approval_flow.name}"
