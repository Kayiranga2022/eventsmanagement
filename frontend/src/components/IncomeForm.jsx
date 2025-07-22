import React, { useEffect, useState } from 'react';
import { getIncomeCategories } from '../services/incomeCategoryService';

// --- IMPORTANT: Ensure Font Awesome is installed and imported globally ---
// If you haven't already:
// 1. Install: npm install --save @fortawesome/fontawesome-free
// 2. Import in your src/index.js (or global CSS file):
//    import '@fortawesome/fontawesome-free/css/all.min.css';
// --------------------------------------------------------------------------

const IncomeForm = ({ onSubmit, initialValues = {}, eventId, isEditing = false, onCancelEdit }) => {
  const [form, setForm] = useState({
    sourceName: '',
    amount: '',
    date: '',
    description: '',
    category: null,
  });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getIncomeCategories();
        setCategories(res.data);
      } catch (error) {
        console.error('Failed to load income categories', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (isEditing && initialValues) {
      setForm({
        sourceName: initialValues.sourceName || '',
        amount: initialValues.amount || '',
        date: initialValues.date ? initialValues.date.split('T')[0] : '', // Ensure date is YYYY-MM-DD
        description: initialValues.description || '',
        category: initialValues.category || null,
      });
      setErrors({});
    } else if (!isEditing) {
      // Reset form when not editing or initialValues are cleared
      setForm({
        sourceName: '',
        amount: '',
        date: '',
        description: '',
        category: null,
      });
      setErrors({});
    }
  }, [initialValues, isEditing]);

  const validate = () => {
    const errs = {};
    if (!form.sourceName.trim()) errs.sourceName = 'Source Name is required.';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) errs.amount = 'Please enter a valid positive amount.';
    if (!form.date) errs.date = 'Date is required.';
    if (!form.category) errs.category = 'Please select a category.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'category') {
      const selected = categories.find(cat => cat.id === parseInt(value));
      setForm({ ...form, category: selected || null });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      ...form,
      amount: parseFloat(form.amount),
      event: { id: eventId },
    });
    // Clear form after successful submission if not editing
    if (!isEditing) {
        setForm({
            sourceName: '',
            amount: '',
            date: '',
            description: '',
            category: null,
        });
    }
  };

  return (
    <div className="card shadow-sm mb-4 border-0 rounded-3"> {/* Modern card styling */}
      <div className={`card-header bg-white py-3 border-0 d-flex align-items-center`}> {/* Neutral header */}
        {isEditing ? (
          <h5 className="mb-0 text-dark fw-semibold">
            <i className="fas fa-edit me-2 text-primary"></i> Edit Income
          </h5>
        ) : (
          <h5 className="mb-0 text-dark fw-semibold">
            <i className="fas fa-plus-circle me-2 text-success"></i> Add New Income
          </h5>
        )}
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <label htmlFor="sourceName" className="form-label text-muted small mb-1">Source Name</label>
            <input
              id="sourceName"
              className={`form-control form-control-lg ${errors.sourceName ? 'is-invalid' : ''}`} // Larger input, subtle invalid
              name="sourceName"
              value={form.sourceName}
              onChange={handleChange}
              placeholder="e.g., Sales, Sponsorship, Grant"
              required
            />
            {errors.sourceName && <div className="invalid-feedback">{errors.sourceName}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="amount" className="form-label text-muted small mb-1">Amount (RWF)</label>
            <input
              id="amount"
              className={`form-control form-control-lg ${errors.amount ? 'is-invalid' : ''}`}
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="e.g., 50000"
              required
            />
            {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="date" className="form-label text-muted small mb-1">Date</label>
            <input
              id="date"
              className={`form-control form-control-lg ${errors.date ? 'is-invalid' : ''}`}
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
            {errors.date && <div className="invalid-feedback">{errors.date}</div>}
          </div>

          <div className="mb-3">
            <label htmlFor="category" className="form-label text-muted small mb-1">Category</label>
            <select
              id="category"
              className={`form-select form-select-lg ${errors.category ? 'is-invalid' : ''}`}
              name="category"
              value={form.category ? form.category.id : ''}
              onChange={handleChange}
              required
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.category && <div className="invalid-feedback">{errors.category}</div>}
          </div>

          <div className="mb-4"> {/* Increased margin bottom */}
            <label htmlFor="description" className="form-label text-muted small mb-1">Description (Optional)</label>
            <textarea
              id="description"
              className="form-control"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief details about this income..."
              rows="3" // Slightly larger for better input experience
            />
          </div>

          <div className="d-flex gap-2 justify-content-end"> {/* Align buttons to the right */}
            {isEditing && (
              <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onCancelEdit}>
                <i className="fas fa-times-circle me-2"></i> Cancel
              </button>
            )}
            <button className="btn btn-success rounded-pill px-4" type="submit"> {/* Success for submit, rounded */}
              <i className={`fas ${isEditing ? 'fa-save' : 'fa-check-circle'} me-2`}></i>
              {isEditing ? 'Update Income' : 'Add Income'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncomeForm;