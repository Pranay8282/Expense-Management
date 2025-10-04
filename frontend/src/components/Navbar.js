import React, { useContext } from 'react';
import AuthContext from '../context/AuthContext';
import { FaUserCircle } from 'react-icons/fa';

const Navbar = () => {
  const { user, logoutUser } = useContext(AuthContext);

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0 text-2xl font-bold text-indigo-600">
            MoneyPath
          </div>
          <div className="flex items-center">
            <div className="mr-4 text-gray-600">
              Welcome, {user?.first_name || user?.username}!
            </div>
            <div className="relative">
              <button className="flex text-sm border-2 border-transparent rounded-full focus:outline-none focus:border-gray-300 transition">
                <FaUserCircle className="h-8 w-8 text-gray-500" />
              </button>
            </div>
            <button
              onClick={logoutUser}
              className="ml-4 px-3 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-200 hover:bg-gray-300"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
