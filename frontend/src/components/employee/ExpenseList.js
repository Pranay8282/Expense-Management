import React, { useState } from 'react';
import dayjs from 'dayjs';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

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
  const [expandedRow, setExpandedRow] = useState(null);

  const toggleRow = (id) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (!expenses || expenses.length === 0) {
    return <p className="text-center text-gray-500 mt-8">No expenses found.</p>;
  }
    
  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3"></th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {expenses.map((expense) => (
            <React.Fragment key={expense.id}>
              <tr>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button onClick={() => toggleRow(expense.id)} className="text-gray-500 hover:text-gray-700">
                    {expandedRow === expense.id ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{dayjs(expense.date).format('MMM D, YYYY')}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{expense.category}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${expense.amount}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <StatusBadge status={expense.status} />
                </td>
              </tr>
              {expandedRow === expense.id && (
                <tr>
                  <td colSpan="6" className="p-4 bg-gray-50">
                    <h4 className="font-semibold text-sm text-gray-700">Approval History:</h4>
                    <ul className="mt-2 space-y-2">
                      {expense.approval_steps.length > 0 ? (
                        expense.approval_steps.map(step => (
                          <li key={step.id} className="text-sm text-gray-600">
                            <strong>Step {step.step_number}:</strong> {step.approver.first_name} {step.approver.last_name} - <StatusBadge status={step.status} />
                            {step.comments && <p className="pl-4 italic text-gray-500">"{step.comments}"</p>}
                          </li>
                        ))
                      ) : (
                        <li className="text-sm text-gray-500">No approval steps found.</li>
                      )}
                    </ul>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseList;
