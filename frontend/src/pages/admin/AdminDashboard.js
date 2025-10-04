import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import ApprovalPanel from '../../components/ApprovalPanel';

const AdminDashboard = () => {
  const [stats, setStats] = useState({ totalExpenses: 0, pending: 0, approved: 0 });
  const [expenses, setExpenses] = useState([]);

  useEffect(() => {
    api.get('/expenses/claims/').then(res => {
      const data = res.data;
      setExpenses(data);
      const newStats = {
        totalExpenses: data.length,
        pending: data.filter(e => e.status === 'PENDING').length,
        approved: data.filter(e => e.status === 'APPROVED').length,
      };
      setStats(newStats);
    }).catch(err => console.error(err));
  }, []);

  const chartData = [
    { name: 'Pending', count: stats.pending, fill: '#FBBF24' },
    { name: 'Approved', count: stats.approved, fill: '#10B981' },
    { name: 'Rejected', count: expenses.filter(e => e.status === 'REJECTED').length, fill: '#EF4444' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">Company Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">Total Expenses</h3>
          <p className="text-3xl font-bold">{stats.totalExpenses}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">Pending Approval</h3>
          <p className="text-3xl font-bold">{stats.pending}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-gray-500">Approved Expenses</h3>
          <p className="text-3xl font-bold">{stats.approved}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="font-semibold mb-4">Expense Status Distribution</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="count" />
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <ApprovalPanel />
    </div>
  );
};

export default AdminDashboard;
