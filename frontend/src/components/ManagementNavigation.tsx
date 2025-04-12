import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../css/ManagementNavigation.css';

const ManagementNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Simplified toggle function that uses the callback form of setState
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prevState => !prevState);
  };

  // Close menu when location changes (i.e., user navigates to a new page)
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    // Remove the auth token from localStorage
    localStorage.removeItem('authToken');
    // Redirect to the login page
    navigate('/manage');
    // No need to explicitly close the mobile menu here since the useEffect will handle it
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
          aria-expanded={mobileMenuOpen}
        >
          <span className="menu-icon"></span>
        </button>

        <ul className={`nav-links ${mobileMenuOpen ? 'show-mobile' : ''}`}>
          <li>
            <Link 
              to="/manage/customers" 
              className={isActive('/manage/customers') ? 'active' : ''}
            >
              Customers
            </Link>
          </li>
          <li>
            <Link 
              to="/manage/reservations" 
              className={isActive('/manage/reservations') ? 'active' : ''}
            >
              Reservations
            </Link>
          </li>
          <li>
            <Link 
              to="/manage/menus" 
              className={isActive('/manage/menus') ? 'active' : ''}
            >
              Menus
            </Link>
          </li>
          <li>
            <Link 
              to="/manage/subscribers" 
              className={isActive('/manage/subscribers') ? 'active' : ''}
            >
              Newsletter
            </Link>
          </li>
          <li>
            <Link 
              to="/" 
              className="back-to-site"
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