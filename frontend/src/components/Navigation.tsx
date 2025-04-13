import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import '../css/Navigation.css';

const Navigation: React.FC = () => {
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