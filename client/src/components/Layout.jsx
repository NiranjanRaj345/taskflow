import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard, ListTodo, Users, User, LogOut } from 'lucide-react';

const Layout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
      isActive ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'
    }`;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">FlowBoard</h1>
              <div className="hidden md:flex ml-10 space-x-4">
                <NavLink to="/" className={navLinkClass} end>
                  <LayoutDashboard size={18} />
                  Dashboard
                </NavLink>
                <NavLink to="/tasks" className={navLinkClass}>
                  <ListTodo size={18} />
                  Tasks
                </NavLink>
                <NavLink to="/teams" className={navLinkClass}>
                  <Users size={18} />
                  Teams
                </NavLink>
                <NavLink to="/profile" className={navLinkClass}>
                  <User size={18} />
                  Profile
                </NavLink>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
