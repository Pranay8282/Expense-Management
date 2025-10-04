import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import EmployeeDashboard from './employee/EmployeeDashboard';
import ManagerDashboard from './manager/ManagerDashboard';
import AdminDashboard from './admin/AdminDashboard';

const Dashboard = () => {
  const { user } = useContext(AuthContext);

  const renderDashboard = () => {
    switch (user?.role) {
      case 'ADMIN':
        return <AdminDashboard />;
      case 'MANAGER':
        return <ManagerDashboard />;
      case 'EMPLOYEE':
        return <EmployeeDashboard />;
      default:
        return <div>Loading dashboard...</div>;
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      {renderDashboard()}
    </div>
  );
};

export default Dashboard;
