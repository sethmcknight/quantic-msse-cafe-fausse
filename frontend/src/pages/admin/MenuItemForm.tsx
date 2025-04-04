import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminMenuApi, adminCategoryApi } from '../../utils/adminApi';
import '../../css/AdminPanel.css';

type Category = {
  id: number;
  name: string;
};

type MenuItemFormData = {
  name: string;
  description: string;
  price: string;
  category_id: string;
  is_vegetarian: boolean;
  is_vegan: boolean;
  is_gluten_free: boolean;
  image_url: string;
};

const MenuItemForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = id !== 'new';
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState<MenuItemFormData>({
    name: '',
    description: '',
    price: '',
    category_id: '',
    is_vegetarian: false,
    is_vegan: false,
    is_gluten_free: false,
    image_url: ''
  });
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoryResponse = await adminCategoryApi.getAll();
        setCategories(categoryResponse.categories);
        
        // If editing, fetch the menu item details
        if (isEditing && id) {
          const menuItemResponse = await adminMenuApi.getOne(parseInt(id));
          const menuItem = menuItemResponse.menu_item;
          
          setFormData({
            name: menuItem.name,
            description: menuItem.description,
            price: menuItem.price.toString(),
            category_id: menuItem.category_id.toString(),
            is_vegetarian: menuItem.is_vegetarian,
            is_vegan: menuItem.is_vegan,
            is_gluten_free: menuItem.is_gluten_free,
            image_url: menuItem.image_url || ''
          });
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load form data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({ ...formData, [name]: checked });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.price || !formData.category_id) {
      setError('Please fill in all required fields.');
      return;
    }
    
    try {
      setSaving(true);
      
      const menuItemData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        category_id: parseInt(formData.category_id),
        is_vegetarian: formData.is_vegetarian,
        is_vegan: formData.is_vegan,
        is_gluten_free: formData.is_gluten_free,
        image_url: formData.image_url || null
      };
      
      if (isEditing && id) {
        await adminMenuApi.update(parseInt(id), menuItemData);
      } else {
        await adminMenuApi.create(menuItemData);
      }
      
      navigate('/admin/menu');
    } catch (err: any) {
      console.error('Error saving menu item:', err);
      setError('Failed to save menu item. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="admin-form-container">
      <h1>{isEditing ? 'Edit Menu Item' : 'Add New Menu Item'}</h1>
      
      {error && <div className="error-message">{error}</div>}
      
      <form className="admin-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category_id">Category *</label>
          <select
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="price">Price ($) *</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            min="0"
            step="0.01"
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="image_url">Image URL</label>
          <input
            type="text"
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <div className="form-group checkbox-group">
          <label>Dietary Options</label>
          <div className="checkbox-options">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_vegetarian"
                checked={formData.is_vegetarian}
                onChange={handleCheckboxChange}
              />
              Vegetarian
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_vegan"
                checked={formData.is_vegan}
                onChange={handleCheckboxChange}
              />
              Vegan
            </label>
            
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_gluten_free"
                checked={formData.is_gluten_free}
                onChange={handleCheckboxChange}
              />
              Gluten Free
            </label>
          </div>
        </div>
        
        <div className="form-buttons">
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Saving...' : isEditing ? 'Update Item' : 'Add Item'}
          </button>
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={() => navigate('/admin/menu')}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenuItemForm;