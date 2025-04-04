import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../css/AdminPanel.css';

const AdminLayout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`bg-gray-800 text-white w-64 space-y-6 py-7 px-2 absolute inset-y-0 left-0 transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } md:relative md:translate-x-0 transition duration-200 ease-in-out z-10`}
      >
        <div className="flex items-center justify-between px-4">
          <h2 className="text-2xl font-bold">Café Fausse Admin</h2>
          <button onClick={toggleSidebar} className="md:hidden">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <nav className="mt-10">
          <NavLink 
            to="/admin/dashboard" 
            className={({isActive}) => 
              `flex items-center py-2 px-4 rounded transition-colors ${
                isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            <span className="mx-4">Dashboard</span>
          </NavLink>

          <NavLink 
            to="/admin/menu" 
            className={({isActive}) => 
              `flex items-center py-2 px-4 rounded transition-colors ${
                isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            <span className="mx-4">Menu Management</span>
          </NavLink>

          <NavLink 
            to="/admin/reservations" 
            className={({isActive}) => 
              `flex items-center py-2 px-4 rounded transition-colors ${
                isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            <span className="mx-4">Reservations</span>
          </NavLink>
          
          <NavLink 
            to="/admin/customers" 
            className={({isActive}) => 
              `flex items-center py-2 px-4 rounded transition-colors ${
                isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            <span className="mx-4">Customers</span>
          </NavLink>
          
          <NavLink 
            to="/admin/employees" 
            className={({isActive}) => 
              `flex items-center py-2 px-4 rounded transition-colors ${
                isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            <span className="mx-4">Employee Management</span>
          </NavLink>
          
          <NavLink 
            to="/admin/newsletter" 
            className={({isActive}) => 
              `flex items-center py-2 px-4 rounded transition-colors ${
                isActive ? 'bg-gray-700 text-white' : 'text-gray-300 hover:bg-gray-700'
              }`
            }
          >
            <span className="mx-4">Newsletter</span>
          </NavLink>
        </nav>

        <div className="px-4 mt-auto">
          <div className="py-4 border-t border-gray-700">
            <div className="flex items-center">
              <div className="mr-3">
                <p className="text-sm font-medium text-gray-300">{user?.first_name} {user?.last_name}</p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-4 w-full flex items-center py-2 px-4 rounded text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between py-4 px-6">
            <button 
              onClick={toggleSidebar} 
              className="md:hidden text-gray-500 focus:outline-none"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center">
              <span className="text-xl font-semibold text-gray-800">Admin Panel</span>
            </div>
            <div className="flex items-center">
              <span className="text-gray-600 mr-2">{user?.first_name} {user?.last_name}</span>
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="flex-1 overflow-y-auto bg-gray-100 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;