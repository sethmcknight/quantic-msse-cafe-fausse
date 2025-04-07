import React from 'react';
import { Link } from 'react-router-dom';
import NewsletterSignup from '../components/NewsletterSignup';
import { ContactInfo, HoursInfo } from '../components/CafeInformation';
import '../css/HomePage.css';

const HomePage: React.FC = () => {
  return (
    <div className="home-page">
      {/* FR-1 - Display restaurant name prominently */}
      <div className="hero-section">
        <div className="hero-overlay">
          <h1>Café Fausse</h1>
          <p className="tagline">Fine dining with a modern twist</p>
          {/* No hero image provided, so we use a fallback background */}
        </div>
      </div>
      
      {/* FR-2 - Show contact information and hours */}
      <section className="info-section">
        <ContactInfo />
        <HoursInfo />
      </section>
      
      {/* FR-4 - Feature highlights with images */}
      <section className="highlights-section">
        <h2>Experience Café Fausse</h2>
        <div className="highlights-grid">
          <div className="highlight-item">
            <div className="highlight-image" id="menu-highlight">
              {/* image in HomePage.css */}
            </div>
            <div className="highlight-caption">Gourmet Menu</div>
          </div>
          <div className="highlight-item">
            <div className="highlight-image" id="ambiance-highlight">
              {/* image in HomePage.css */}
            </div>
            <div className="highlight-caption">Elegant Ambiance</div>
          </div>
          <div className="highlight-item">
            <div className="highlight-image" id="chef-highlight">
              {/* image in HomePage.css */}
            </div>
            <div className="highlight-caption">Chef’s Masterpieces</div>
          </div>
        </div>
      </section>
      
      {/* FR-4 - Provide navigation to main sections with visual elements */}
      <section className="quick-links">
        <h2>Explore Café Fausse</h2>
        <div className="links-grid">
          <Link to="/menu" className="quick-link">
            <div className="link-image menu-image">
              {/* image in HomePage.css */}
            </div>
            <h3>Our Menu</h3>
          </Link>
          <Link to="/reservations" className="quick-link">
            <div className="link-image reservation-image">
              {/* image in HomePage.css */}
            </div>
            <h3>Make a Reservation</h3>
          </Link>
          <Link to="/gallery" className="quick-link">
            <div className="link-image gallery-image">
              {/* image in HomePage.css */}
            </div>
            <h3>Gallery</h3>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;