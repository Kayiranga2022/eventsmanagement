import React, { useEffect, useState } from 'react';
import { getExpenseCategories } from '../services/ExpenseCategoryService';

// --- IMPORTANT: Ensure Font Awesome is installed and imported globally ---
// If you haven't already:
// 1. Install: npm install --save @fortawesome/fontawesome-free
// 2. Import in your src/index.js (or global CSS file):
//    import '@fortawesome/fontawesome-free/css/all.min.css';
// --------------------------------------------------------------------------

const ExpenseForm = ({ onSubmit, initialValues = {}, eventId, isEditing = false }) => {
  const [form, setForm] = useState({
    amount: '',
    date: '',
    description: '',
    category: null,
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await getExpenseCategories();
        setCategories(res.data);
      } catch (error) {
        console.error('Failed to load expense categories', error);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (initialValues) {
      setForm({
        amount: initialValues.amount || '',
        // Ensure date is in YYYY-MM-DD format for input type="date"
        date: initialValues.date ? initialValues.date.split('T')[0] : '',
        description: initialValues.description || '',
        category: initialValues.category || null,
      });
    }
  }, [initialValues]);

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
    if (!form.category) {
      alert('Please select a category');
      return;
    }

    onSubmit({
      ...form,
      amount: parseFloat(form.amount),
      event: { id: eventId },
    });

    // Original logic to clear form after submission
    setForm({
      amount: '',
      date: '',
      description: '',
      category: null,
    });
  };

  return (
    <div className="card shadow-sm mb-4 border-0 rounded-3"> {/* Modern card styling, removed inline style */}
      <div className={`card-header bg-white py-3 border-0 d-flex align-items-center`}> {/* Neutral header */}
        {isEditing ? (
          <h5 className="mb-0 text-dark fw-semibold">
            <i className="fas fa-edit me-2 text-primary"></i> Edit Expense
          </h5>
        ) : (
          <h5 className="mb-0 text-dark fw-semibold">
            <i className="fas fa-minus-circle me-2 text-danger"></i> Add New Expense
          </h5>
        )}
      </div>
      <div className="card-body"> {/* Removed p-3 and small classes here, let Bootstrap handle padding */}
        <form onSubmit={handleSubmit}>
          <div className="mb-3"> {/* Increased mb for better spacing */}
            <label htmlFor="expenseCategory" className="form-label text-muted small mb-1">Category</label>
            <select
              id="expenseCategory"
              className="form-select form-select-lg" // Removed trailing comment from this line
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
          </div>

          <div className="mb-3">
            <label htmlFor="expenseAmount" className="form-label text-muted small mb-1">Amount (RWF)</label>
            <input
              id="expenseAmount"
              className="form-control form-control-lg" // Removed trailing comment from this line
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="e.g., 15000"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="expenseDate" className="form-label text-muted small mb-1">Date</label>
            <input
              id="expenseDate"
              className="form-control form-control-lg" // Removed trailing comment from this line
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-4"> {/* Increased mb for better spacing */}
            <label htmlFor="expenseDescription" className="form-label text-muted small mb-1">Description (Optional)</label>
            <textarea
              id="expenseDescription"
              className="form-control" // Removed trailing comment from this line
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief details about this expense..."
              rows="3" // Removed trailing comment from this line
            />
          </div>

          <div className="d-flex gap-2 justify-content-end"> {/* Align buttons to the right */}
            {isEditing && ( // Only show cancel if editing
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-4"
                onClick={() => { /* Original code didn't have onCancelEdit, leaving empty for now */ }}
              >
                <i className="fas fa-times-circle me-2"></i> Cancel
              </button>
            )}
            <button className="btn btn-danger rounded-pill px-4" type="submit"> {/* Danger for submit (expense), rounded */}
              <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus-circle'} me-2`}></i> {/* Changed to fa-plus-circle for add */}
              {isEditing ? 'Update Expense' : 'Add Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;