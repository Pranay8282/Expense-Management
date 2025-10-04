# MoneyPath – Smart Expense Reimbursement System

MoneyPath is a full-stack smart expense management application designed to streamline and automate the expense reimbursement process for companies. It features OCR for receipt scanning, role-based access control, and a multi-level approval workflow.

## Core Features

-   **Role-Based Access**: Pre-configured roles for Admin, Manager, and Employee with distinct permissions.
-   **Expense Submission**: Employees can easily submit expense claims with details and receipt images.
-   **OCR Receipt Scanning**: Utilizes Tesseract.js on the frontend to automatically extract data from uploaded receipts, simplifying form filling.
-   **Multi-Level Approval Workflow**: Expenses are routed through a predefined approval chain (e.g., Employee's Manager -> Admin).
-   **Role-Specific Dashboards**:
    -   **Admin**: Company-wide analytics, user management, and expense overview.
    -   **Manager**: A dedicated queue to approve or reject expenses submitted by their team members.
    -   **Employee**: A personal dashboard to submit new expenses and track the status of past submissions.
-   **JWT Authentication**: Secure, token-based authentication for all users.

## Tech Stack

-   **Backend**: Django, Django REST Framework
-   **Frontend**: React.js, TailwindCSS
-   **Database**: SQLite (for development), PostgreSQL (production-ready)
-   **Authentication**: Simple JWT for Django REST Framework
-   **OCR**: Tesseract.js (Client-side)

## Setup and Installation

Follow these instructions to get the project running on your local machine.

### Prerequisites

-   Python 3.8+ and `pip`
-   Node.js 16+ and `npm`
-   Git

### Backend Setup

1.  **Navigate to the backend directory:**
    ```bash
    cd expense-system/backend
    ```

2.  **Create a virtual environment and activate it:**
    ```bash
    # Create the virtual environment
    python -m venv venv

    # Activate on Windows
    .\venv\Scripts\activate

    # Activate on macOS/Linux
    source venv/bin/activate
    ```

3.  **Install Python dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4.  **Create and apply database migrations:**
    ```bash
    python manage.py makemigrations users expenses
    python manage.py migrate
    ```

5.  **Seed the database with sample data (recommended):**
    ```bash
    python manage.py seed_data
    ```

6.  **Run the backend server:**
    ```bash
    python manage.py runserver
    ```
    The backend API will be running at `http://127.0.0.1:8000`.

### Frontend Setup

1.  **Open a new terminal** and navigate to the frontend directory:
    ```bash
    cd expense-system/frontend
    ```

2.  **Install JavaScript dependencies:**
    ```bash
    npm install
    ```

3.  **Run the frontend development server:**
    ```bash
    npm start
    ```
    The React application will be accessible at `http://localhost:3000`.

## How to Use

-   **Sign Up**: Navigate to `http://localhost:3000/signup` to create a new company and an admin account.
-   **Log In**: Use the credentials you created or the pre-seeded demo accounts to log in.

### Demo Accounts (from `seed_data` command)

-   **Admin**:
    -   **Username**: `admin`
    -   **Password**: `password123`
-   **Manager**:
    -   **Username**: `manager`
    -   **Password**: `password123`
-   **Employee**:
    -   **Username**: `employee1`
    -   **Password**: `password123`
