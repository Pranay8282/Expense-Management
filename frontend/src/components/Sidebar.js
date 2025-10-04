import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { FaTachometerAlt, FaFileInvoiceDollar, FaTasks, FaUsersCog } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

const Sidebar = () => {
  const { user } = useContext(AuthContext);

  const commonLinks = [
    { name: 'Dashboard', to: '/dashboard', icon: FaTachometerAlt },
  ];

  const roleLinks = {
    EMPLOYEE: [
      { name: 'My Expenses', to: '/my-expenses', icon: FaFileInvoiceDollar },
    ],
    MANAGER: [
      { name: 'Approval Queue', to: '/approvals', icon: FaTasks },
    ],
    ADMIN: [
      { name: 'User Management', to: '/users', icon: FaUsersCog },
      { name: 'Approval Rules', to: '/rules', icon: FaTasks },
    ],
  };

  const links = [...commonLinks, ...(roleLinks[user?.role] || [])];

  return (
    <aside className="w-64 bg-white shadow-lg h-screen">
      <div className="p-4">
        <nav>
          <ul>
            {links.map((link) => (
              <li key={link.name}>
                <NavLink
                  to={link.to}
                  className={({ isActive }) =>
                    `flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                      isActive
                        ? 'bg-indigo-500 text-white'
                        : 'text-gray-600 hover:bg-gray-200'
                    }`
                  }
                >
                  <link.icon className="w-5 h-5" />
                  <span className="ml-4 font-medium">{link.name}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
