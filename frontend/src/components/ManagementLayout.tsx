import React from 'react';
import ManagementNavigation from './ManagementNavigation';
import Footer from './Footer';

interface ManagementLayoutProps {
  children: React.ReactNode;
}

const ManagementLayout: React.FC<ManagementLayoutProps> = ({ children }) => {
  return (
    <div className="management-layout">
      <ManagementNavigation />
      <main className="management-content">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default ManagementLayout;