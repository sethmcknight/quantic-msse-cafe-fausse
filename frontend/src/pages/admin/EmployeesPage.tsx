import React, { useState, useEffect } from 'react';
import { employeeApi } from '../../utils/adminApi';
import { useAppContext } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import '../../css/AdminPanel.css';

type Employee = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  is_active: boolean;
  last_login: string | null;
  created_at: string;
};

type EmployeeFormData = {
  id?: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  password: string;
  is_active: boolean;
};

const AdminEmployeesPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const { showNotification } = useAppContext();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState<boolean>(false);
  const [formData, setFormData] = useState<EmployeeFormData>({
    username: '',
    email: '',
    first_name: '',
    last_name: '',
    role: 'staff',
    password: '',
    is_active: true
  });
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await employeeApi.getAll();
        setEmployees(response.employees);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching employees:', err);
        setError('Failed to load employees. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Handle opening employee form
  const handleAddNew = () => {
    setFormData({
      username: '',
      email: '',
      first_name: '',
      last_name: '',
      role: 'staff',
      password: '',
      is_active: true
    });
    setIsEditing(false);
    setFormOpen(true);
  };

  // Handle editing employee
  const handleEdit = (employee: Employee) => {
    setFormData({
      id: employee.id,
      username: employee.username,
      email: employee.email,
      first_name: employee.first_name,
      last_name: employee.last_name,
      role: employee.role,
      password: '',
      is_active: employee.is_active
    });
    setIsEditing(true);
    setFormOpen(true);
  };

  // Handle form change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Form validation
  const validateForm = (): boolean => {
    // Check required fields
    if (!formData.username.trim() || !formData.email.trim() || 
        !formData.first_name.trim() || !formData.last_name.trim()) {
      setError('All fields marked with * are required');
      return false;
    }
    
    // Check password for new employees
    if (!isEditing && !formData.password) {
      setError('Password is required for new employees');
      return false;
    }
    
    // Check email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }
    
    return true;
  };

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      if (isEditing && formData.id) {
        // Update existing employee
        const updateData = { ...formData };
        // Only include password if it was provided
        if (!updateData.password) {
          delete updateData.password;
        }
        
        const response = await employeeApi.update(formData.id, updateData);
        
        setEmployees(prev => prev.map(emp => 
          emp.id === formData.id ? response.employee : emp
        ));
        
        showNotification('Employee updated successfully', 'success');
      } else {
        // Create new employee
        const response = await employeeApi.create(formData);
        
        setEmployees(prev => [...prev, response.employee]);
        showNotification('Employee created successfully', 'success');
      }
      
      setFormOpen(false);
    } catch (err: any) {
      console.error('Error saving employee:', err);
      const errorMessage = err.response?.data?.error || 'Failed to save employee. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Handle employee activation/deactivation
  const handleToggleActive = async (id: number, currentStatus: boolean) => {
    try {
      await employeeApi.update(id, { is_active: !currentStatus });
      
      // Update local state
      setEmployees(prev => prev.map(emp => 
        emp.id === id ? { ...emp, is_active: !currentStatus } : emp
      ));
      
      showNotification(`Employee ${currentStatus ? 'deactivated' : 'activated'} successfully`, 'success');
    } catch (err: any) {
      console.error('Error toggling employee status:', err);
      showNotification('Failed to update employee status', 'error');
    }
  };

  if (loading && !formOpen) {
    return <div className="admin-loading">Loading employees...</div>;
  }

  return (
    <div className="admin-employees-page">
      <div className="page-header">
        <h1>Employee Management</h1>
        <button className="btn btn-primary" onClick={handleAddNew}>
          Add New Employee
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {formOpen ? (
        <div className="admin-form-container">
          <form className="admin-form" onSubmit={handleSubmit}>
            <h2>{isEditing ? 'Edit Employee' : 'Add New Employee'}</h2>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="username">Username *</label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="first_name">First Name *</label>
                <input
                  type="text"
                  id="first_name"
                  name="first_name"
                  value={formData.first_name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="last_name">Last Name *</label>
                <input
                  type="text"
                  id="last_name"
                  name="last_name"
                  value={formData.last_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="password">
                  {isEditing ? 'New Password (leave blank to keep current)' : 'Password *'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={!isEditing}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Role *</label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleChange}
                  required
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>
            
            <div className="form-group checkbox">
              <input
                type="checkbox"
                id="is_active"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
              />
              <label htmlFor="is_active">Active</label>
            </div>
            
            <div className="form-buttons">
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Employee'}
              </button>
              
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setFormOpen(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="data-table">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map(employee => (
                <tr key={employee.id}>
                  <td>{`${employee.first_name} ${employee.last_name}`}</td>
                  <td>{employee.username}</td>
                  <td>{employee.email}</td>
                  <td className="capitalize">{employee.role}</td>
                  <td>
                    <span className={`status status-${employee.is_active ? 'active' : 'inactive'}`}>
                      {employee.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{formatDate(employee.last_login)}</td>
                  <td className="action-buttons">
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleEdit(employee)}
                    >
                      Edit
                    </button>
                    
                    {/* Don't allow deactivating yourself */}
                    {currentUser && employee.id !== currentUser.id && (
                      <button
                        className={`btn ${employee.is_active ? 'btn-warning' : 'btn-success'} btn-sm`}
                        onClick={() => handleToggleActive(employee.id, employee.is_active)}
                      >
                        {employee.is_active ? 'Deactivate' : 'Activate'}
                      </button>
                    )}
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

export default AdminEmployeesPage;