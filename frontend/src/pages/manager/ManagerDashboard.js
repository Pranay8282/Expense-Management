import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import dayjs from 'dayjs';

const ManagerDashboard = () => {
  const [queue, setQueue] = useState([]);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [action, setAction] = useState(null); // 'approve' or 'reject'
  const [comments, setComments] = useState('');

  const fetchQueue = useCallback(async () => {
    try {
      const response = await api.get('/expenses/approval_queue/');
      setQueue(response.data);
    } catch (error) {
      console.error("Failed to fetch approval queue", error);
      toast.error("Could not load approval queue.");
    }
  }, []);

  useEffect(() => {
    fetchQueue();
  }, [fetchQueue]);

  const openModal = (expense, type) => {
    setSelectedExpense(expense);
    setAction(type);
    setComments('');
  };

  const closeModal = () => {
    setSelectedExpense(null);
    setAction(null);
  };

  const handleAction = async () => {
    if (!selectedExpense || !action) return;

    try {
      await api.post(`/expenses/${selectedExpense.id}/${action}/`, { comments });
      toast.success(`Expense ${action}d successfully.`);
      fetchQueue();
      closeModal();
    } catch (error) {
      toast.error(`Failed to ${action} expense.`);
      console.error(error);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Approval Queue</h2>
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {queue.map((expense) => (
              <tr key={expense.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.employee.first_name} {expense.employee.last_name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dayjs(expense.date).format('MMM D, YYYY')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{expense.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${expense.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button onClick={() => openModal(expense, 'approve')} className="text-indigo-600 hover:text-indigo-900">Approve</button>
                  <button onClick={() => openModal(expense, 'reject')} className="text-red-600 hover:text-red-900">Reject</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {queue.length === 0 && <p className="text-center text-gray-500 p-4">Approval queue is empty.</p>}
      </div>

      {selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-lg font-bold mb-4 capitalize">{action} Expense</h3>
            <p><strong>Employee:</strong> {selectedExpense.employee.first_name} {selectedExpense.employee.last_name}</p>
            <p><strong>Amount:</strong> ${selectedExpense.amount}</p>
            <p><strong>Description:</strong> {selectedExpense.description}</p>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700">Comments (optional)</label>
              <textarea value={comments} onChange={(e) => setComments(e.target.value)} rows="3" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"></textarea>
            </div>
            <div className="mt-6 flex justify-end space-x-4">
              <button onClick={closeModal} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md">Cancel</button>
              <button onClick={handleAction} className={`px-4 py-2 text-white rounded-md ${action === 'approve' ? 'bg-green-600' : 'bg-red-600'}`}>
                Confirm {action}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerDashboard;
