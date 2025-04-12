import React, { useEffect, useState, useMemo } from 'react';
import '../css/ManageMenus.css';
import ManagementNavigation from '../components/ManagementNavigation';
import Footer from '../components/Footer';

interface MenuItem {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
}

interface MenuCategory {
  id: number;
  name: string;
}

interface SortConfig {
  key: keyof MenuItem;
  direction: 'asc' | 'desc';
}

// New item and category form interfaces
interface NewMenuItem {
  name: string;
  description: string;
  price: string;
  category_id: string;
}

interface NewMenuCategory {
  name: string;
}

const MenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [activeTable, setActiveTable] = useState<'items' | 'categories'>('items');
  
  // Sorting and filtering states
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [nameFilter, setNameFilter] = useState<string>('');
  const [minPriceFilter, setMinPriceFilter] = useState<string>('');
  const [maxPriceFilter, setMaxPriceFilter] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('');

  // New state for adding items/categories
  const [showNewItemForm, setShowNewItemForm] = useState<boolean>(false);
  const [showNewCategoryForm, setShowNewCategoryForm] = useState<boolean>(false);
  const [newItem, setNewItem] = useState<NewMenuItem>({
    name: '',
    description: '',
    price: '',
    category_id: ''
  });
  const [newCategory, setNewCategory] = useState<NewMenuCategory>({
    name: ''
  });
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  
  // Loading and error state
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  // Auth token (in a real app, this would come from your auth system)
  const [authToken, setAuthToken] = useState<string>('');

  // Get auth token on component mount
  useEffect(() => {
    // For demo purposes, you might want to set a token here
    // In a real app, this would come from your authentication system
    const token = localStorage.getItem('auth_token') || 'demo-token';
    setAuthToken(token);
  }, []);

  // Fetch both menu items and categories
  const fetchMenuData = async () => {
    setIsLoading(true);
    try {
      // Fetch menu items
      const itemsResponse = await fetch('/api/menu/items');
      if (!itemsResponse.ok) {
        throw new Error('Failed to fetch menu items');
      }
      const itemsData = await itemsResponse.json();
      if (itemsData.success && Array.isArray(itemsData.items)) {
        setMenuItems(itemsData.items);
      }

      // Fetch categories
      const categoriesResponse = await fetch('/api/menu/categories');
      if (!categoriesResponse.ok) {
        throw new Error('Failed to fetch menu categories');
      }
      const categoriesData = await categoriesResponse.json();
      if (categoriesData.success && Array.isArray(categoriesData.categories)) {
        setMenuCategories(categoriesData.categories);
      }
    } catch (error) {
      console.error('Error fetching menu data:', error);
      setErrorMessage('Failed to load menu data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuData();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/menu/categories');
      if (!response.ok) {
        throw new Error('Failed to fetch categories');
      }
      const data = await response.json();
      // Sort categories by id in ascending order
      const sortedCategories = data.categories.sort((a: { id: number }, b: { id: number }) => a.id - b.id);
      setMenuCategories(sortedCategories);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const updateMenuItem = async (id: number, updatedFields: Partial<MenuItem>) => {
    try {
      const response = await fetch(`/api/menu/items/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields),
      });

      if (!response.ok) {
        throw new Error('Failed to update menu item');
      }

      const data = await response.json();
      if (data.success) {
        console.log(`Menu item ${id} updated successfully`);
      } else {
        console.error(`Failed to update menu item: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating menu item:', error);
    }
  };

  const updateCategory = async (id: number, updatedFields: Partial<MenuCategory>) => {
    try {
      const response = await fetch(`/api/menu/categories/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields),
      });

      if (!response.ok) {
        throw new Error('Failed to update category');
      }

      const data = await response.json();
      if (data.success) {
        console.log(`Category ${id} updated successfully`);
        // Re-fetch categories to reflect the update
        fetchCategories();
      } else {
        console.error(`Failed to update category: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating category:', error);
    }
  };

  const handleEditItem = (id: number, field: string, value: string | number) => {
    setMenuItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );

    // Update the backend
    updateMenuItem(id, { [field]: value });
  };

  const handleEditCategory = (id: number, field: string, value: string) => {
    setMenuCategories(prevCategories =>
      prevCategories.map(category =>
        category.id === id ? { ...category, [field]: value } : category
      )
    );

    // Update the backend
    updateCategory(id, { [field]: value });
  };

  const handleEditItemCategory = (id: number, categoryId: number) => {
    setMenuItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, category_id: categoryId } : item
      )
    );

    // Update the backend
    updateMenuItem(id, { category_id: categoryId });
  };

  // Sorting function
  const handleSort = (key: keyof MenuItem) => {
    setSortConfig(prevConfig => {
      if (prevConfig && prevConfig.key === key) {
        if (prevConfig.direction === 'asc') {
          return { key, direction: 'desc' };
        } else {
          return null; // Clear sorting
        }
      }
      return { key, direction: 'asc' };
    });
  };

  // Get category name from id
  // Removed unused getCategoryName function to resolve the compile error

  // Handle filter changes
  const handleNameFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameFilter(e.target.value);
  };

  const handleMinPriceFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMinPriceFilter(e.target.value);
  };

  const handleMaxPriceFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxPriceFilter(e.target.value);
  };

  const handleCategoryFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setCategoryFilter(e.target.value);
  };

  // Clear filters
  const clearNameFilter = () => setNameFilter('');
  const clearPriceFilters = () => {
    setMinPriceFilter('');
    setMaxPriceFilter('');
  };
  const clearCategoryFilter = () => setCategoryFilter('');

  // Get sort indicator arrow
  const getSortIndicator = (key: keyof MenuItem) => {
    if (sortConfig && sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return ' ⇅';
  };

  // Filter and sort menu items
  const filteredAndSortedMenuItems = useMemo(() => {
    let filtered = [...menuItems];

    // Apply name filter
    if (nameFilter) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    // Apply price filters
    if (minPriceFilter) {
      filtered = filtered.filter(item => 
        item.price >= parseFloat(minPriceFilter)
      );
    }

    if (maxPriceFilter) {
      filtered = filtered.filter(item => 
        item.price <= parseFloat(maxPriceFilter)
      );
    }

    // Apply category filter
    if (categoryFilter) {
      filtered = filtered.filter(item => 
        item.category_id === parseInt(categoryFilter, 10)
      );
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [menuItems, nameFilter, minPriceFilter, maxPriceFilter, categoryFilter, sortConfig]);

  // Add new menu item
  const handleAddMenuItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      if (!newItem.name || !newItem.price || !newItem.category_id) {
        throw new Error('Please fill all required fields (name, price, category)');
      }
      
      const response = await fetch('/api/menu/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: newItem.name,
          description: newItem.description,
          price: parseFloat(newItem.price),
          category_id: parseInt(newItem.category_id, 10)
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add menu item');
      }
      
      // Success - consume the response but don't need to use the data
      await response.json();
      setNewItem({
        name: '',
        description: '',
        price: '',
        category_id: ''
      });
      setShowNewItemForm(false);
      fetchMenuData();
    } catch (error) {
      console.error('Error adding menu item:', error);
      setErrorMessage(`Failed to add menu item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Add new category
  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      if (!newCategory.name) {
        throw new Error('Please provide a category name');
      }
      
      const response = await fetch('/api/menu/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({
          name: newCategory.name
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add category');
      }
      
      // Success - consume the response but don't need to use the data
      await response.json();
      setNewCategory({ name: '' });
      setShowNewCategoryForm(false);
      fetchMenuData();
    } catch (error) {
      console.error('Error adding category:', error);
      setErrorMessage(`Failed to add category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete menu item
  const handleDeleteMenuItem = async (id: number) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const response = await fetch(`/api/menu/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete menu item');
      }
      
      // Success - update UI and fetch updated data
      setMenuItems(prevItems => prevItems.filter(item => item.id !== id));
      setItemToDelete(null);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setErrorMessage(`Failed to delete menu item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete category
  const handleDeleteCategory = async (id: number) => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // Check if there are menu items using this category
      const hasItems = menuItems.some(item => item.category_id === id);
      if (hasItems) {
        throw new Error('Cannot delete category that has menu items. Please reassign or delete those items first.');
      }
      
      const response = await fetch(`/api/menu/categories/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete category');
      }
      
      // Success - update UI and fetch updated data
      setMenuCategories(prevCategories => prevCategories.filter(category => category.id !== id));
      setCategoryToDelete(null);
    } catch (error) {
      console.error('Error deleting category:', error);
      setErrorMessage(`Failed to delete category: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <ManagementNavigation />
      <div className="menu-management">
        <h1>Manage Menus</h1>

        {errorMessage && (
          <div className="error-message">
            <p>{errorMessage}</p>
            <button onClick={() => setErrorMessage('')}>Dismiss</button>
          </div>
        )}

        <nav className="menu-management-nav">
          <button
            className={activeTable === 'items' ? 'active' : ''}
            onClick={() => setActiveTable('items')}
          >
            Menu Items
          </button>
          <button
            className={activeTable === 'categories' ? 'active' : ''}
            onClick={() => setActiveTable('categories')}
          >
            Menu Categories
          </button>
        </nav>

        {activeTable === 'items' && (
          <>
            <div className="action-bar">
              <h2>Menu Items</h2>
              <button 
                className="add-button"
                onClick={() => setShowNewItemForm(!showNewItemForm)}
              >
                {showNewItemForm ? 'Cancel' : 'Add New Item'}
              </button>
            </div>
            
            {showNewItemForm && (
              <div className="new-item-form">
                <h3>Add New Menu Item</h3>
                <form onSubmit={handleAddMenuItem}>
                  <div className="form-group">
                    <label htmlFor="item-name">Name *</label>
                    <input
                      id="item-name"
                      type="text"
                      value={newItem.name}
                      onChange={(e) => setNewItem({...newItem, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="item-description">Description</label>
                    <textarea
                      id="item-description"
                      value={newItem.description}
                      onChange={(e) => setNewItem({...newItem, description: e.target.value})}
                      rows={3}
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="item-price">Price *</label>
                    <input
                      id="item-price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={newItem.price}
                      onChange={(e) => setNewItem({...newItem, price: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="item-category">Category *</label>
                    <select
                      id="item-category"
                      value={newItem.category_id}
                      onChange={(e) => setNewItem({...newItem, category_id: e.target.value})}
                      required
                    >
                      <option value="">Select a category</option>
                      {menuCategories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="submit-button" disabled={isLoading}>
                      {isLoading ? 'Adding...' : 'Add Item'}
                    </button>
                    <button type="button" onClick={() => setShowNewItemForm(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            <div className="filtered-count">
              <p>Showing {filteredAndSortedMenuItems.length} of {menuItems.length} items</p>
            </div>
            <div className="table-grid-container">
              <table className="items-table">
                <thead>
                  <tr>
                    <th onClick={() => handleSort('id')}>
                      ID{getSortIndicator('id')}
                    </th>
                    <th onClick={() => handleSort('name')}>
                      Name{getSortIndicator('name')}
                      <div className="filter-input">
                        <input
                          type="text"
                          value={nameFilter}
                          onChange={handleNameFilterChange}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Filter by name..."
                        />
                        {nameFilter && (
                          <button 
                            className="clear-filter" 
                            onClick={(e) => {
                              e.stopPropagation();
                              clearNameFilter();
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </th>
                    <th onClick={() => handleSort('description')}>
                      Description{getSortIndicator('description')}
                    </th>
                    <th onClick={() => handleSort('price')}>
                      Price{getSortIndicator('price')}
                      <div className="filter-input price-filter">
                        <input
                          type="number"
                          value={minPriceFilter}
                          onChange={handleMinPriceFilterChange}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Min"
                          min="0"
                          step="0.01"
                        />
                        <span>-</span>
                        <input
                          type="number"
                          value={maxPriceFilter}
                          onChange={handleMaxPriceFilterChange}
                          onClick={(e) => e.stopPropagation()}
                          placeholder="Max"
                          min="0"
                          step="0.01"
                        />
                        {(minPriceFilter || maxPriceFilter) && (
                          <button 
                            className="clear-filter" 
                            onClick={(e) => {
                              e.stopPropagation();
                              clearPriceFilters();
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </th>
                    <th onClick={() => handleSort('category_id')}>
                      Category{getSortIndicator('category_id')}
                      <div className="filter-input">
                        <select
                          value={categoryFilter}
                          onChange={handleCategoryFilterChange}
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="">All Categories</option>
                          {menuCategories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                        {categoryFilter && (
                          <button 
                            className="clear-filter" 
                            onClick={(e) => {
                              e.stopPropagation();
                              clearCategoryFilter();
                            }}
                          >
                            ×
                          </button>
                        )}
                      </div>
                    </th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAndSortedMenuItems.map(item => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>
                        <input
                          type="text"
                          value={item.name}
                          onChange={e => handleEditItem(item.id, 'name', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={item.description}
                          onChange={e => handleEditItem(item.id, 'description', e.target.value)}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={item.price}
                          onChange={e => handleEditItem(item.id, 'price', parseFloat(e.target.value))}
                          min="0"
                          step="0.01"
                        />
                      </td>
                      <td>
                        <select
                          value={item.category_id}
                          onChange={e => handleEditItemCategory(item.id, parseInt(e.target.value, 10))}
                        >
                          <option value="">Select Category</option>
                          {menuCategories.map(category => (
                            <option key={category.id} value={category.id}>
                              {category.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>
                        {itemToDelete === item.id ? (
                          <div className="delete-confirmation">
                            <span>Are you sure?</span>
                            <button onClick={() => handleDeleteMenuItem(item.id)} className="confirm-delete">Yes</button>
                            <button onClick={() => setItemToDelete(null)} className="cancel-delete">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setItemToDelete(item.id)} className="delete-button">Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTable === 'categories' && (
          <>
            <div className="action-bar">
              <h2>Menu Categories</h2>
              <button 
                className="add-button"
                onClick={() => setShowNewCategoryForm(!showNewCategoryForm)}
              >
                {showNewCategoryForm ? 'Cancel' : 'Add New Category'}
              </button>
            </div>
            
            {showNewCategoryForm && (
              <div className="new-category-form">
                <h3>Add New Category</h3>
                <form onSubmit={handleAddCategory}>
                  <div className="form-group">
                    <label htmlFor="category-name">Name *</label>
                    <input
                      id="category-name"
                      type="text"
                      value={newCategory.name}
                      onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="form-actions">
                    <button type="submit" className="submit-button" disabled={isLoading}>
                      {isLoading ? 'Adding...' : 'Add Category'}
                    </button>
                    <button type="button" onClick={() => setShowNewCategoryForm(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            <div className="table-grid-container">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {menuCategories.map(category => (
                    <tr key={category.id}>
                      <td>{category.id}</td>
                      <td>
                        <input
                          type="text"
                          value={category.name}
                          onChange={e => handleEditCategory(category.id, 'name', e.target.value)}
                        />
                      </td>
                      <td>
                        {categoryToDelete === category.id ? (
                          <div className="delete-confirmation">
                            <span>Are you sure?</span>
                            <button onClick={() => handleDeleteCategory(category.id)} className="confirm-delete">Yes</button>
                            <button onClick={() => setCategoryToDelete(null)} className="cancel-delete">No</button>
                          </div>
                        ) : (
                          <button onClick={() => setCategoryToDelete(category.id)} className="delete-button">Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
      <Footer />
    </>
  );
};

export default MenuManagement;