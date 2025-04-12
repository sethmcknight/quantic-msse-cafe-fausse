import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import InlineNotification from '../components/InlineNotification';
import '../css/MenuPage.css';

const MenuPage: React.FC = () => {
  const { menuItems, categories, isLoading, error, refreshMenuData } = useAppContext();
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [notification, setNotification] = useState<{message: string; type: 'success' | 'error' | 'info'} | null>(null);

  // Sort categories by ID in ascending order
  const sortedCategories = [...categories].sort((a, b) => a.id - b.id);

  // Handle errors from context
  useEffect(() => {
    if (error) {
      setNotification({
        message: `Error loading menu: ${error}`,
        type: 'error'
      });
    }
  }, [error]);

  // Retry loading menu data
  const handleRetryLoad = () => {
    refreshMenuData();
    setNotification({
      message: 'Retrying to load menu data...',
      type: 'info'
    });
  };

  // Clear notification
  const clearNotification = () => {
    setNotification(null);
  };

  if (isLoading) {
    return <div className="loading">Loading menu...</div>;
  }

  const renderCategoryFilter = () => (
    <div className="category-filter">
      {sortedCategories.map(category => (
        <button 
          key={category.id}
          className={selectedCategory === category.id ? 'active' : ''}
          onClick={() => setSelectedCategory(category.id)}
        >
          {category.name}
        </button>
      ))}
      <button 
        className={selectedCategory === null ? 'active' : ''}
        onClick={() => setSelectedCategory(null)}
      >
        All Items
      </button>
    </div>
  );

  // When a single category is selected, display a single section.
  if (selectedCategory !== null) {
    const filteredItems = menuItems.filter(item => item.category_id === selectedCategory);
    return (
      <div className="menu-page">
        <h1>Our Menu</h1>
        
        {/* Display notification if exists */}
        {notification && (
          <InlineNotification
            message={notification.message}
            type={notification.type}
            onDismiss={clearNotification}
          />
        )}
        
        {error && (
          <div className="retry-container">
            <button onClick={handleRetryLoad} className="retry-button">
              Retry Loading Menu
            </button>
          </div>
        )}
        
        {renderCategoryFilter()}
        
        {filteredItems.length > 0 ? (
          <section className="menu-list">
            {filteredItems.map(item => (
              <div key={item.id} className="menu-item">
                <div className="menu-item-title">
                  <h3>{item.name}</h3>
                </div>
                <p className="description">{item.description}</p>
                <p className="price">${item.price.toFixed(2)}</p>
              </div>
            ))}
          </section>
        ) : (
          <div className="no-items">No items found in this category.</div>
        )}
      </div>
    );
  }

  // When "All Items" is selected use category grouping.
  return (
    <div className="menu-page">
      <h1>Our Menu</h1>
      
      {/* Display notification if exists */}
      {notification && (
        <InlineNotification
          message={notification.message}
          type={notification.type}
          onDismiss={clearNotification}
        />
      )}
      
      {error && (
        <div className="retry-container">
          <button onClick={handleRetryLoad} className="retry-button">
            Retry Loading Menu
          </button>
        </div>
      )}
      
      {renderCategoryFilter()}
      
      {sortedCategories.map(category => {
        // Filter items for the current category.
        const categoryItems = menuItems.filter(item => item.category_id === category.id);
        if (categoryItems.length === 0) return null;
        return (
          <section key={category.id} className="menu-category">
            <h2 className="category-header">{category.name}</h2>
            <div className="menu-list">
              {categoryItems.map(item => (
                <div key={item.id} className="menu-item">
                  <div className="menu-item-title">
                    <h3>{item.name}</h3>
                  </div>
                  <p className="description">{item.description}</p>
                  <p className="price">${item.price.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
};

export default MenuPage;