import React, { useEffect, useState, useMemo } from 'react';
import '../css/ManageCustomers.css';
import ManagementNavigation from '../components/ManagementNavigation';
import Footer from '../components/Footer';

interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  newsletter_signup: boolean;
  created_at: string | null;
  updated_at: string | null;
}

interface SortConfig {
  key: keyof Customer;
  direction: 'asc' | 'desc';
}

interface NewCustomerData {
  name: string;
  email: string;
  phone: string;
  newsletter_signup: boolean;
}

const CustomerManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  
  // Sorting and filtering states
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);
  const [nameFilter, setNameFilter] = useState<string>('');
  const [emailFilter, setEmailFilter] = useState<string>('');
  const [phoneFilter, setPhoneFilter] = useState<string>('');
  const [newsletterFilter, setNewsletterFilter] = useState<string>('');
  
  // New customer form states
  const [showNewCustomerForm, setShowNewCustomerForm] = useState<boolean>(false);
  const [newCustomer, setNewCustomer] = useState<NewCustomerData>({
    name: '',
    email: '',
    phone: '',
    newsletter_signup: false
  });
  const [formErrors, setFormErrors] = useState<Partial<NewCustomerData>>({});

  useEffect(() => {
    // Fetch customers from the backend API
    fetchCustomers();
  }, []);

  const fetchCustomers = () => {
    fetch('/api/customers')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch customers');
        }
        return response.json();
      })
      .then(data => {
        if (data.success && Array.isArray(data.customers)) {
          setCustomers(data.customers);
        } else {
          console.error('Unexpected data format:', data);
          setCustomers([]);
        }
      })
      .catch(error => {
        console.error('Error fetching customers:', error);
        setCustomers([]);
      });
  };

  const updateCustomer = async (id: number, updatedFields: Partial<Customer>) => {
    try {
      const response = await fetch(`/api/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedFields),
      });

      if (!response.ok) {
        throw new Error('Failed to update customer');
      }

      const data = await response.json();
      if (data.success) {
        console.log(`Customer ${id} updated successfully`);
      } else {
        console.error(`Failed to update customer: ${data.message}`);
      }
    } catch (error) {
      console.error('Error updating customer:', error);
    }
  };

  const handleEditCustomer = (id: number, field: string, value: string | boolean) => {
    setCustomers(prevCustomers =>
      prevCustomers.map(customer =>
        customer.id === id ? { ...customer, [field]: value } : customer
      )
    );

    // Update the backend
    updateCustomer(id, { [field]: value });
  };

  // Sorting function
  const handleSort = (key: keyof Customer) => {
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

  // Handle filter changes
  const handleNameFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNameFilter(e.target.value);
  };

  const handleEmailFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailFilter(e.target.value);
  };

  const handlePhoneFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneFilter(e.target.value);
  };

  const handleNewsletterFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewsletterFilter(e.target.value);
  };

  // Clear filters
  const clearNameFilter = () => setNameFilter('');
  const clearEmailFilter = () => setEmailFilter('');
  const clearPhoneFilter = () => setPhoneFilter('');
  const clearNewsletterFilter = () => setNewsletterFilter('');

  // Get sort indicator arrow
  const getSortIndicator = (key: keyof Customer) => {
    if (sortConfig && sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? ' ▲' : ' ▼';
    }
    return ' ⇅';
  };

  // Handle new customer form changes
  const handleNewCustomerChange = (field: keyof NewCustomerData, value: string | boolean) => {
    setNewCustomer(prev => ({ ...prev, [field]: value }));
    
    // Clear error for the field being changed
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Validate new customer form
  const validateForm = (): boolean => {
    const errors: Partial<NewCustomerData> = {};
    
    if (!newCustomer.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!newCustomer.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(newCustomer.email)) {
      errors.email = 'Email is invalid';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Submit new customer
  const handleSubmitNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCustomer),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create customer');
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Refresh customer list
        fetchCustomers();
        
        // Reset form and hide it
        setNewCustomer({
          name: '',
          email: '',
          phone: '',
          newsletter_signup: false
        });
        setShowNewCustomerForm(false);
      } else {
        console.error('Failed to create customer:', data.message);
        alert(`Failed to create customer: ${data.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating customer:', error);
      alert('Failed to create customer. Please try again.');
    }
  };

  // Toggle new customer form
  const toggleNewCustomerForm = () => {
    setShowNewCustomerForm(!showNewCustomerForm);
    // Reset form and errors when toggling
    if (!showNewCustomerForm) {
      setNewCustomer({
        name: '',
        email: '',
        phone: '',
        newsletter_signup: false
      });
      setFormErrors({});
    }
  };

  // Filter and sort customers
  const filteredAndSortedCustomers = useMemo(() => {
    let filtered = [...customers];

    // Apply name filter
    if (nameFilter) {
      filtered = filtered.filter(customer => 
        customer.name.toLowerCase().includes(nameFilter.toLowerCase())
      );
    }

    // Apply email filter
    if (emailFilter) {
      filtered = filtered.filter(customer => 
        customer.email.toLowerCase().includes(emailFilter.toLowerCase())
      );
    }

    // Apply phone filter
    if (phoneFilter) {
      filtered = filtered.filter(customer => 
        customer.phone && customer.phone.includes(phoneFilter)
      );
    }

    // Apply newsletter filter
    if (newsletterFilter) {
      const isSubscribed = newsletterFilter === 'true';
      filtered = filtered.filter(customer => 
        customer.newsletter_signup === isSubscribed
      );
    }

    // Apply sorting
    if (sortConfig) {
      filtered.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];

        // Handle null values for proper comparison
        if (aVal === null && bVal === null) return 0;
        if (aVal === null) return sortConfig.direction === 'asc' ? -1 : 1;
        if (bVal === null) return sortConfig.direction === 'asc' ? 1 : -1;

        // Safe comparison now that we've handled null cases
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
  }, [customers, nameFilter, emailFilter, phoneFilter, newsletterFilter, sortConfig]);

  return (
    <>
      <ManagementNavigation />
      <div className="customer-management">
        <h1>Manage Customers</h1>

        <div className="customer-management-actions">
          <button 
            className="add-customer-button" 
            onClick={toggleNewCustomerForm}
          >
            {showNewCustomerForm ? 'Cancel' : 'Add New Customer'}
          </button>
        </div>

        {showNewCustomerForm && (
          <div className="new-customer-form-container">
            <h2>Add New Customer</h2>
            <form onSubmit={handleSubmitNewCustomer} className="new-customer-form">
              <div className="form-group">
                <label htmlFor="name">Name*</label>
                <input
                  id="name"
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => handleNewCustomerChange('name', e.target.value)}
                  placeholder="Customer Name"
                  className={formErrors.name ? 'error' : ''}
                />
                {formErrors.name && <div className="error-message">{formErrors.name}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email*</label>
                <input
                  id="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => handleNewCustomerChange('email', e.target.value)}
                  placeholder="customer@example.com"
                  className={formErrors.email ? 'error' : ''}
                />
                {formErrors.email && <div className="error-message">{formErrors.email}</div>}
              </div>
              
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  type="tel"
                  value={newCustomer.phone}
                  onChange={(e) => handleNewCustomerChange('phone', e.target.value)}
                  placeholder="(123) 456-7890"
                />
              </div>
              
              <div className="form-group checkbox-group">
                <label htmlFor="newsletter">
                  <input
                    id="newsletter"
                    type="checkbox"
                    checked={newCustomer.newsletter_signup}
                    onChange={(e) => handleNewCustomerChange('newsletter_signup', e.target.checked)}
                  />
                  Subscribe to Newsletter
                </label>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="submit-button">Add Customer</button>
                <button type="button" onClick={toggleNewCustomerForm} className="cancel-button">Cancel</button>
              </div>
            </form>
          </div>
        )}

        <div className="filtered-count">
          <p>Showing {filteredAndSortedCustomers.length} of {customers.length} customers</p>
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
                <th onClick={() => handleSort('email')}>
                  Email{getSortIndicator('email')}
                  <div className="filter-input">
                    <input
                      type="text"
                      value={emailFilter}
                      onChange={handleEmailFilterChange}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Filter by email..."
                    />
                    {emailFilter && (
                      <button 
                        className="clear-filter" 
                        onClick={(e) => {
                          e.stopPropagation();
                          clearEmailFilter();
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('phone')}>
                  Phone{getSortIndicator('phone')}
                  <div className="filter-input">
                    <input
                      type="text"
                      value={phoneFilter}
                      onChange={handlePhoneFilterChange}
                      onClick={(e) => e.stopPropagation()}
                      placeholder="Filter by phone..."
                    />
                    {phoneFilter && (
                      <button 
                        className="clear-filter" 
                        onClick={(e) => {
                          e.stopPropagation();
                          clearPhoneFilter();
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('newsletter_signup')}>
                  Newsletter{getSortIndicator('newsletter_signup')}
                  <div className="filter-input">
                    <select
                      value={newsletterFilter}
                      onChange={handleNewsletterFilterChange}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">All</option>
                      <option value="true">Subscribed</option>
                      <option value="false">Not Subscribed</option>
                    </select>
                    {newsletterFilter && (
                      <button 
                        className="clear-filter" 
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNewsletterFilter();
                        }}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
                <th onClick={() => handleSort('created_at')}>
                  Created At{getSortIndicator('created_at')}
                </th>
                <th onClick={() => handleSort('updated_at')}>
                  Updated At{getSortIndicator('updated_at')}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedCustomers.map(customer => (
                <tr key={customer.id}>
                  <td>{customer.id}</td>
                  <td>
                    <input
                      type="text"
                      value={customer.name}
                      onChange={e => handleEditCustomer(customer.id, 'name', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="email"
                      value={customer.email}
                      onChange={e => handleEditCustomer(customer.id, 'email', e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      type="tel"
                      value={customer.phone || ''}
                      onChange={e => handleEditCustomer(customer.id, 'phone', e.target.value)}
                    />
                  </td>
                  <td>
                    <select
                      value={customer.newsletter_signup.toString()}
                      onChange={e => handleEditCustomer(customer.id, 'newsletter_signup', e.target.value === 'true')}
                      className="newsletter-select"
                    >
                      <option value="true">Subscribed</option>
                      <option value="false">Not Subscribed</option>
                    </select>
                  </td>
                  <td>{customer.created_at ? new Date(customer.created_at).toLocaleString() : 'N/A'}</td>
                  <td>{customer.updated_at ? new Date(customer.updated_at).toLocaleString() : 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default CustomerManagement;