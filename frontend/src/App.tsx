import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Page Components
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import ReservationsPage from './pages/ReservationsPage';
import AboutPage from './pages/AboutPage';
import GalleryPage from './pages/GalleryPage';
import NotFoundPage from './pages/NotFoundPage';
import ReservationManagement from './pages/ReservationManagement';
import NewsletterManagement from './pages/NewsletterManagement';
import MenuManagement from './pages/MenuManagement';
import CustomerManagement from './pages/CustomerManagement';

// Layout Components
import Navigation from './components/Navigation';
import Footer from './components/Footer';

// Context Provider
import { AppProvider } from './context/AppContext';

// App Content Component
const AppContent: React.FC = () => {
  return (
    <div className="App">
      <Routes>
        {/* Management Routes - Navigation is included in each page */}
        <Route path="/customer/management" element={<CustomerManagement />} />
        <Route path="/reservations/management" element={<ReservationManagement />} />
        <Route path="/newsletter/management" element={<NewsletterManagement />} />
        <Route path="/menu/management" element={<MenuManagement />} />
        
        {/* Regular Routes with standard Navigation */}
        <Route path="/" element={
          <>
            <Navigation />
            <main className="main-content">
              <HomePage />
            </main>
            <Footer />
          </>
        } />
        <Route path="/menu" element={
          <>
            <Navigation />
            <main className="main-content">
              <MenuPage />
            </main>
            <Footer />
          </>
        } />
        <Route path="/reservations" element={
          <>
            <Navigation />
            <main className="main-content">
              <ReservationsPage />
            </main>
            <Footer />
          </>
        } />
        <Route path="/about" element={
          <>
            <Navigation />
            <main className="main-content">
              <AboutPage />
            </main>
            <Footer />
          </>
        } />
        <Route path="/gallery" element={
          <>
            <Navigation />
            <main className="main-content">
              <GalleryPage />
            </main>
            <Footer />
          </>
        } />
        <Route path="*" element={
          <>
            <Navigation />
            <main className="main-content">
              <NotFoundPage />
            </main>
            <Footer />
          </>
        } />
      </Routes>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        <AppContent />
      </Router>
    </AppProvider>
  );
};

export default App;
