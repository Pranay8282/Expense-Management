from django.core.management.base import BaseCommand
from django.utils import timezone
from users.models import Company, User
from expenses.models import Expense
import decimal

class Command(BaseCommand):
    help = 'Seeds the database with initial data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Deleting old data...')
        Company.objects.all().delete()
        User.objects.all().delete()
        Expense.objects.all().delete()

        self.stdout.write('Creating new data...')

        # Create Company
        company = Company.objects.create(name='Innovate Inc.', country='United States', currency='USD')

        # Create Admin
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@innovate.com',
            password='password123',
            first_name='Admin',
            last_name='User',
            role='ADMIN',
            company=company
        )

        # Create Manager
        manager = User.objects.create_user(
            username='manager',
            email='manager@innovate.com',
            password='password123',
            first_name='Manager',
            last_name='Person',
            role='MANAGER',
            company=company,
            is_manager_approver=True
        )

        # Create Employees
        employee1 = User.objects.create_user(
            username='employee1',
            email='employee1@innovate.com',
            password='password123',
            first_name='John',
            last_name='Doe',
            role='EMPLOYEE',
            company=company,
            manager=manager
        )

        employee2 = User.objects.create_user(
            username='employee2',
            email='employee2@innovate.com',
            password='password123',
            first_name='Jane',
            last_name='Smith',
            role='EMPLOYEE',
            company=company,
            manager=manager
        )

        # Create Expenses
        Expense.objects.create(
            employee=employee1,
            amount=decimal.Decimal('150.75'),
            currency='USD',
            converted_amount=decimal.Decimal('150.75'),
            category='Travel',
            description='Client meeting lunch',
            date=timezone.now().date(),
            status='PENDING'
        )

        Expense.objects.create(
            employee=employee2,
            amount=decimal.Decimal('89.99'),
            currency='USD',
            converted_amount=decimal.Decimal('89.99'),
            category='Software',
            description='New design software subscription',
            date=timezone.now().date(),
            status='PENDING'
        )

        self.stdout.write(self.style.SUCCESS('Successfully seeded database.'))
