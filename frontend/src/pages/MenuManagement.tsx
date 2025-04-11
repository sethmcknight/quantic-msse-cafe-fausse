import React, { useEffect, useState, useMemo } from 'react';
import '../css/MenuManagement.css';
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

  useEffect(() => {
    // Fetch menu items from the backend API
    fetch('/api/menu/items')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch menu items');
        }
        return response.json();
      })
      .then(data => {
        if (data.success && Array.isArray(data.items)) {
          setMenuItems(data.items);
        } else {
          console.error('Unexpected data format:', data);
          setMenuItems([]);
        }
      })
      .catch(error => {
        console.error('Error fetching menu items:', error);
        setMenuItems([]);
      });

    // Fetch menu categories from the backend API
    fetch('/api/menu/categories')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch menu categories');
        }
        return response.json();
      })
      .then(data => {
        if (data.success && Array.isArray(data.categories)) {
          setMenuCategories(data.categories);
        } else {
          console.error('Unexpected data format:', data);
          setMenuCategories([]);
        }
      })
      .catch(error => {
        console.error('Error fetching menu categories:', error);
        setMenuCategories([]);
      });
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
  const getCategoryName = (categoryId: number) => {
    const category = menuCategories.find(cat => cat.id === categoryId);
    return category ? category.name : 'Unknown';
  };

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

  return (
    <>
      <ManagementNavigation />
      <div className="menu-management">
        <h1>Menu Management</h1>

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
            <h2>Menu Items</h2>
            <div className="filtered-count">
              <p>Showing {filteredAndSortedMenuItems.length} of {menuItems.length} items</p>
            </div>
            <div className="table-container" style={{ overflowX: "auto" }}>
              <table>
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {activeTable === 'categories' && (
          <>
            <h2>Menu Categories</h2>
            <div className="table-container" style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
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