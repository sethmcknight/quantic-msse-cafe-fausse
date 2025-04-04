import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { adminMenuApi, adminCategoryApi } from '../../utils/adminApi';
import { useAppContext } from '../../context/AppContext';
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
  const navigate = useNavigate();
  const { showNotification } = useAppContext();
  const isEditMode = !!id;
  
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
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch categories
        const categoryResponse = await adminCategoryApi.getAll();
        setCategories(categoryResponse.categories);
        
        // If edit mode, fetch menu item data
        if (isEditMode) {
          const menuResponse = await adminMenuApi.getOne(Number(id));
          const item = menuResponse.menu_item;
          
          setFormData({
            name: item.name,
            description: item.description,
            price: item.price.toString(),
            category_id: item.category_id.toString(),
            is_vegetarian: item.is_vegetarian,
            is_vegan: item.is_vegan,
            is_gluten_free: item.is_gluten_free,
            image_url: item.image_url || ''
          });
        }
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching data:', err);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, isEditMode]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.name.trim()) {
      setError('Name is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      setError('Price must be a positive number');
      return false;
    }
    
    if (!formData.category_id) {
      setError('Please select a category');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setSubmitting(true);
      setError(null);
      
      const itemData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        price: Number(formData.price),
        category_id: Number(formData.category_id),
        is_vegetarian: formData.is_vegetarian,
        is_vegan: formData.is_vegan,
        is_gluten_free: formData.is_gluten_free,
        image_url: formData.image_url.trim() || null
      };
      
      if (isEditMode) {
        await adminMenuApi.update(Number(id), itemData);
        showNotification('Menu item updated successfully!', 'success');
      } else {
        await adminMenuApi.create(itemData);
        showNotification('Menu item created successfully!', 'success');
      }
      
      navigate('/admin/menu');
    } catch (err: any) {
      console.error('Error submitting form:', err);
      const errorMessage = err.response?.data?.error || 'Failed to save menu item. Please try again.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading...</div>;
  }

  return (
    <div className="menu-item-form">
      <h1>{isEditMode ? 'Edit Menu Item' : 'Add New Menu Item'}</h1>
      
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
          <label htmlFor="description">Description *</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            required
          />
        </div>
        
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="price">Price ($) *</label>
            <input
              type="number"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              step="0.01"
              min="0"
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
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="form-group">
          <label htmlFor="image_url">Image URL</label>
          <input
            type="url"
            id="image_url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>
        
        <div className="form-row dietary-options">
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="is_vegetarian"
              name="is_vegetarian"
              checked={formData.is_vegetarian}
              onChange={handleChange}
            />
            <label htmlFor="is_vegetarian">Vegetarian</label>
          </div>
          
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="is_vegan"
              name="is_vegan"
              checked={formData.is_vegan}
              onChange={handleChange}
            />
            <label htmlFor="is_vegan">Vegan</label>
          </div>
          
          <div className="form-group checkbox">
            <input
              type="checkbox"
              id="is_gluten_free"
              name="is_gluten_free"
              checked={formData.is_gluten_free}
              onChange={handleChange}
            />
            <label htmlFor="is_gluten_free">Gluten-Free</label>
          </div>
        </div>
        
        <div className="form-buttons">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save Menu Item'}
          </button>
          
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => navigate('/admin/menu')}
            disabled={submitting}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default MenuItemForm;