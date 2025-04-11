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
              Menu
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
        </ul>
      </nav>
    </header>
  );
};

export default ManagementNavigation;