/**
 * Navigation Component
 * 
 * Provides the main navigation menu for the Café Fausse website.
 * Features responsive design with mobile menu toggle functionality.
 * Highlights the active page in the navigation based on the current route.
 * 
 * @component
 */
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/Navigation.css';

const Navigation: React.FC = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * Toggles the mobile menu open/closed state
   */
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  /**
   * Closes the mobile menu
   * Used when a navigation link is clicked
   */
  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

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

  return (
    <header className="site-header">
      <nav className="main-navigation">
        <div className="nav-logo">
          <Link to="/">Café Fausse</Link>
        </div>

        <button 
          className={`mobile-menu-toggle ${mobileMenuOpen ? 'active' : ''}`}
          onClick={toggleMobileMenu}
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
        >
          <span className="menu-icon"></span>
        </button>

        <ul className={`nav-links ${mobileMenuOpen ? 'show-mobile' : ''}`}>
          <li>
            <Link 
              to="/" 
              className={isActive('/') ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              Home
            </Link>
          </li>
          <li>
            <Link 
              to="/menu" 
              className={isActive('/menu') ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              Menu
            </Link>
          </li>
          <li>
            <Link 
              to="/reservations" 
              className={isActive('/reservations') ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              Reservations
            </Link>
          </li>
          <li>
            <Link 
              to="/about" 
              className={isActive('/about') ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              About Us
            </Link>
          </li>
          <li>
            <Link 
              to="/gallery" 
              className={isActive('/gallery') ? 'active' : ''}
              onClick={closeMobileMenu}
            >
              Gallery
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
};

export default Navigation;