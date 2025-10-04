import React, { createContext, useState, useEffect } from 'react';
import jwt_decode from 'jwt-decode';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();
export default AuthContext;

const baseURL = 'http://127.0.0.1:8000/api/';

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem('authTokens') ? JSON.parse(localStorage.getItem('authTokens')) : null
  );
  const [user, setUser] = useState(() =>
    localStorage.getItem('authTokens') ? jwt_decode(JSON.parse(localStorage.getItem('authTokens')).access) : null
  );
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const loginUser = async (username, password) => {
    try {
      const response = await axios.post(baseURL + 'users/login/', { username, password });
      setAuthTokens(response.data);
      setUser(response.data.user);
      localStorage.setItem('authTokens', JSON.stringify(response.data));
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Login failed. Please check your credentials.');
      console.error(error);
    }
  };

  const signupUser = async (userData) => {
    try {
      await axios.post(baseURL + 'users/register/', userData);
      toast.success('Signup successful! Please log in.');
      navigate('/login');
    } catch (error) {
      toast.error('Signup failed. Please try again.');
      console.error(error);
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem('authTokens');
    navigate('/login');
    toast.success('Logged out successfully.');
  };

  useEffect(() => {
    if (authTokens) {
        // Fetch full user profile to get role etc.
        axios.get(baseURL + 'users/profile/', {
            headers: {
                Authorization: `Bearer ${authTokens.access}`
            }
        }).then(res => setUser(res.data)).catch(() => logoutUser());
    }
    setLoading(false);
      }, [authTokens, logoutUser]);

  const contextData = {
    user,
    authTokens,
    loginUser,
    logoutUser,
    signupUser,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};
