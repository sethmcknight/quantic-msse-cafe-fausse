import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/ManagementNavigation.css';

const ManagementNavigation: React.FC = () => {
  const location = useLocation();
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
              to="/customer/management" 
              className={isActive('/customer/management') ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              Customers
            </Link>
          </li>
          <li>
            <Link 
              to="/reservations/management" 
              className={isActive('/reservations/management') ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              Reservations
            </Link>
          </li>
          <li>
            <Link 
              to="/menu/management" 
              className={isActive('/menu/management') ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              Menu
            </Link>
          </li>
          <li>
            <Link 
              to="/newsletter/management" 
              className={isActive('/newsletter/management') ? 'active' : ''}
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
        </ul>
      </nav>
    </header>
  );
};

export default ManagementNavigation;