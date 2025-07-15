import React, { useEffect, useState } from 'react';
import { getExpenseCategories } from '../services/ExpenseCategoryService';

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
        date: initialValues.date || '',
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

    setForm({
      amount: '',
      date: '',
      description: '',
      category: null,
    });
  };

  return (
    <div className="card shadow-sm mb-3" style={{ maxWidth: '600px', margin: '0 auto' }}>
      <div className="card-header bg-danger text-white py-2 px-3 fw-semibold small">
        {isEditing ? '✏️ Edit Expense' : '➕ Add New Expense'}
      </div>
      <div className="card-body p-3">
        <form onSubmit={handleSubmit} className="small">
          <div className="mb-2">
            <label className="form-label mb-1">Category</label>
            <select
              className="form-select form-select-sm"
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

          <div className="mb-2">
            <label className="form-label mb-1">Amount</label>
            <input
              className="form-control form-control-sm"
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="Amount"
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label mb-1">Date</label>
            <input
              className="form-control form-control-sm"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
          </div>

          <div className="mb-2">
            <label className="form-label mb-1">Description</label>
            <textarea
              className="form-control form-control-sm"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Optional description..."
              rows="2"
            />
          </div>

          <div className="text-end">
            <button className="btn btn-sm btn-danger px-3" type="submit">
              {isEditing ? 'Update' : 'Add'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
