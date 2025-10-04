import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import UserManagement from './pages/admin/UserManagement';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route 
        path="/*"
        element={
          <ProtectedRoute>
            <Layout>
              <Routes>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/users" element={<UserManagement />} />
                {/* Add other protected routes here */}
                <Route path="/" element={<Dashboard />} />
              </Routes>
            </Layout>
          </ProtectedRoute>
        } 
      />
    </Routes>
  );
}

export default App;
