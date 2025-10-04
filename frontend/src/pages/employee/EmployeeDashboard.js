import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import ExpenseForm from '../../components/employee/ExpenseForm';
import ExpenseList from '../../components/employee/ExpenseList';

const EmployeeDashboard = () => {
  const [expenses, setExpenses] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const fetchExpenses = useCallback(async () => {
    try {
      const response = await api.get('/expenses/');
      setExpenses(response.data);
    } catch (error) {
      console.error("Failed to fetch expenses", error);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const handleExpenseAdded = () => {
    fetchExpenses();
    setIsFormOpen(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-700">My Expenses</h2>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Submit New Expense
        </button>
      </div>
      
      {isFormOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-center items-center">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl relative">
                <button onClick={() => setIsFormOpen(false)} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl">&times;</button>
                <ExpenseForm onExpenseAdded={handleExpenseAdded} />
            </div>
        </div>
      )}

      <ExpenseList expenses={expenses} />
    </div>
  );
};

export default EmployeeDashboard;
