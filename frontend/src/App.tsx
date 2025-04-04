import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import './App.css';

// Page Components
import HomePage from './pages/HomePage';
import MenuPage from './pages/MenuPage';
import ReservationsPage from './pages/ReservationsPage';
import AboutPage from './pages/AboutPage';
import GalleryPage from './pages/GalleryPage';
import NotFoundPage from './pages/NotFoundPage';

// Admin Components
import AdminLoginPage from './pages/admin/LoginPage';
import AdminDashboardPage from './pages/admin/DashboardPage';
import AdminMenuPage from './pages/admin/MenuPage';
import AdminReservationsPage from './pages/admin/ReservationsPage';
import AdminEmployeesPage from './pages/admin/EmployeesPage';
import AdminLayout from './components/admin/AdminLayout';
import ProtectedRoute from './components/admin/ProtectedRoute';
import MenuItemForm from './components/admin/MenuItemForm';

// Layout Components
import Navigation from './components/Navigation';
import Footer from './components/Footer';

// Context Providers
import { AppProvider } from './context/AppContext';
import { AuthProvider } from './context/AuthContext';

// App Content Component (to use context hooks)
const AppContent: React.FC = () => {
  return (
    <Routes>
      {/* Admin Routes */}
      <Route path="/admin">
        <Route path="login" element={<AdminLoginPage />} />
        <Route 
          path="" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="menu" element={<AdminMenuPage />} />
          <Route path="menu/new" element={<MenuItemForm />} />
          <Route path="menu/:id/edit" element={<MenuItemForm />} />
          <Route path="reservations" element={<AdminReservationsPage />} />
          <Route 
            path="employees" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminEmployeesPage />
              </ProtectedRoute>
            } 
          />
          {/* More admin routes will go here */}
          <Route path="*" element={<Navigate to="/admin/dashboard" />} />
        </Route>
      </Route>
      
      {/* Public Routes */}
      <Route 
        path="/" 
        element={
          <div className="App">
            <Navigation />
            <main className="main-content">
              <Outlet />
            </main>
            <Footer />
          </div>
        }
      >
        <Route index element={<HomePage />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="about" element={<AboutPage />} />
        <Route path="gallery" element={<GalleryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

// Main App Component
const App: React.FC = () => {
  return (
    <AppProvider>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </AppProvider>
  );
};

export default App;
