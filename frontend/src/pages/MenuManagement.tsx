import React, { useEffect, useState } from 'react';
import '../css/MenuManagement.css';

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

const MenuManagement: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [menuCategories, setMenuCategories] = useState<MenuCategory[]>([]);
  const [activeTable, setActiveTable] = useState<'items' | 'categories'>('items');

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

  return (
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
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Description</th>
                <th>Price</th>
                <th>Category</th>
              </tr>
            </thead>
            <tbody>
              {menuItems.map(item => (
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
        </>
      )}

      {activeTable === 'categories' && (
        <>
          <h2>Menu Categories</h2>
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
        </>
      )}
    </div>
  );
};

export default MenuManagement;