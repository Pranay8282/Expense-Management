import React from 'react';
import dayjs from 'dayjs';

const StatusBadge = ({ status }) => {
    const baseClasses = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
    const statusClasses = {
        PENDING: "bg-yellow-100 text-yellow-800",
        APPROVED: "bg-green-100 text-green-800",
        REJECTED: "bg-red-100 text-red-800",
    };
    return <span className={`${baseClasses} ${statusClasses[status]}`}>{status}</span>;
};

const ExpenseList = ({ expenses }) => {
  if (!expenses || expenses.length === 0) {
    return <p className="text-center text-gray-500 mt-8">No expenses found.</p>;
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {expenses.map((expense) => (
            <tr key={expense.id}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dayjs(expense.date).format('MMM D, YYYY')}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.description}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.category}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${expense.amount}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <StatusBadge status={expense.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseList;
