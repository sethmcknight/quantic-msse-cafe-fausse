/**
 * ManagementNavigation Component
 * 
 * Navigation bar for the Café Fausse management interface.
 * Provides links to various administrative sections including customer management,
 * reservations, menus, and newsletter subscribers. Also includes logout functionality
 * and a responsive design with mobile menu toggle.
 */
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import '../css/ManagementNavigation.css';

/**
 * ManagementNavigation Component
 * 
 * A specialized navigation component for the administrative section of the website.
 * Includes authentication-aware features like logout functionality and restricted section access.
 * Features a responsive design that works on both desktop and mobile devices.
 * 
 * @component
 */
const ManagementNavigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * Toggles the mobile menu open/closed state
   * Uses the functional form of setState to ensure latest state
   */
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prevState => !prevState);
  };

  /**
   * Effect to close the mobile menu when navigating to a different page
   * This prevents the menu from staying open after navigation
   */
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  /**
   * Determines if the given path matches the current location
   * Used to highlight the active navigation item
   * 
   * @param path - The path to check against current location
   * @returns boolean indicating if the path is active
   */
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  /**
   * Handles user logout by removing the auth token and redirecting
   * to the login page
   */
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