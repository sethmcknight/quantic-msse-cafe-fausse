import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../css/ManagementNavigation.css';

const ManagementNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    // Remove the auth token from localStorage
    localStorage.removeItem('authToken');
    // Redirect to the login page
    navigate('/manage');
    // Close mobile menu if open
    closeMobileMenu();
  };

  return (
    <header className="management-header">
      <nav className="management-navigation">
        <div className="nav-logo">
          <Link to="/">Café Fausse Management</Link>
        </div>

        <button 
          className="mobile-menu-toggle" 
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <span className="menu-icon"></span>
        </button>

        <ul className={`nav-links ${mobileMenuOpen ? 'show-mobile' : ''}`}>
          <li>
            <Link 
              to="/manage/customers" 
              className={isActive('/manage/customers') ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              Customers
            </Link>
          </li>
          <li>
            <Link 
              to="/manage/reservations" 
              className={isActive('/manage/reservations') ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              Reservations
            </Link>
          </li>
          <li>
            <Link 
              to="/manage/menus" 
              className={isActive('/manage/menus') ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              Menus
            </Link>
          </li>
          <li>
            <Link 
              to="/manage/subscribers" 
              className={isActive('/manage/subscribers') ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              Newsletter
            </Link>
          </li>
          <li>
            <Link 
              to="/" 
              className="back-to-site"
              onClick={closeMobileMenu}
            >
              Back to Website
            </Link>
          </li>
          <li>
            <button 
              className="logout-button" 
              onClick={handleLogout}
              aria-label="Logout"
            >
              Logout
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default ManagementNavigation;