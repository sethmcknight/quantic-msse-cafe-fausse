import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminMenuApi, adminCategoryApi } from '../../utils/adminApi';
import '../../css/AdminPanel.css';

type MenuItem = {
  id: number;
  name: string;
  description: string;
  price: number;
  category_id: number;
  category_name?: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  image_url: string | null;
};

type Category = {
  id: number;
  name: string;
};

const AdminMenuPage: React.FC = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<number | string>('all');
  const [sortBy, setSortBy] = useState<string>('name');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Fetch menu items and categories
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [menuResponse, categoryResponse] = await Promise.all([
          adminMenuApi.getAll(),
          adminCategoryApi.getAll()
        ]);
        
        // Map category names to menu items
        const categoriesMap = categoryResponse.categories.reduce((acc: Record<number, string>, cat: Category) => {
          acc[cat.id] = cat.name;
          return acc;
        }, {});
        
        const itemsWithCategoryNames = menuResponse.menu_items.map((item: MenuItem) => ({
          ...item,
          category_name: categoriesMap[item.category_id] || 'Unknown'
        }));
        
        setMenuItems(itemsWithCategoryNames);
        setCategories(categoryResponse.categories);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load menu items. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Delete menu item
  const handleDelete = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this menu item?')) {
      return;
    }
    
    try {
      await adminMenuApi.delete(id);
      setMenuItems(prevItems => prevItems.filter(item => item.id !== id));
    } catch (err: any) {
      console.error('Error deleting item:', err);
      setError('Failed to delete menu item. Please try again.');
    }
  };

  // Filter and sort menu items
  const filteredItems = menuItems
    .filter(item => {
      const matchesCategory = filterCategory === 'all' || item.category_id === filterCategory;
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            item.description.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesCategory && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'price':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'category':
          return (a.category_name || '').localeCompare(b.category_name || '');
        default:
          return a.name.localeCompare(b.name);
      }
    });

  if (loading) {
    return <div className="admin-loading">Loading menu items...</div>;
  }

  return (
    <div className="admin-menu-page">
      <div className="page-header">
        <h1>Menu Management</h1>
        <Link to="/admin/menu/new" className="btn btn-primary">Add New Item</Link>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      <div className="filters-container">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search menu items..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="filter-options">
          <select 
            value={filterCategory} 
            onChange={e => setFilterCategory(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="name">Sort by Name (A-Z)</option>
            <option value="price">Sort by Price (Low to High)</option>
            <option value="price-desc">Sort by Price (High to Low)</option>
            <option value="category">Sort by Category</option>
          </select>
        </div>
      </div>
      
      {filteredItems.length === 0 ? (
        <p>No menu items found. {searchTerm && 'Try a different search term.'}</p>
      ) : (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Price</th>
                <th>Dietary</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(item => (
                <tr key={item.id}>
                  <td>{item.name}</td>
                  <td>{item.category_name}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td className="dietary-info">
                    {item.is_vegetarian && <span title="Vegetarian">🥬</span>}
                    {item.is_vegan && <span title="Vegan">🌱</span>}
                    {item.is_gluten_free && <span title="Gluten-Free">🌾</span>}
                  </td>
                  <td className="action-buttons">
                    <Link to={`/admin/menu/${item.id}/edit`} className="btn btn-secondary btn-sm">
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="btn btn-danger btn-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminMenuPage;