import React, { useEffect, useState } from 'react';
import { getIncomeCategories } from '../services/incomeCategoryService';

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
    if (initialValues && isEditing) {
      setForm({
        sourceName: initialValues.sourceName || '',
        amount: initialValues.amount || '',
        date: initialValues.date || '',
        description: initialValues.description || '',
        category: initialValues.category || null,
      });
      setErrors({});
    } else if (!isEditing) {
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
    if (!form.sourceName.trim()) errs.sourceName = 'Source Name is required';
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0) errs.amount = 'Enter a valid positive amount';
    if (!form.date) errs.date = 'Date is required';
    if (!form.category) errs.category = 'Please select a category';
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
  };

  return (
    <div className="card shadow-sm mb-4">
      <div className={`card-header ${isEditing ? 'bg-warning' : 'bg-primary'} text-white fw-semibold`}>
        {isEditing ? '✏️ Edit Income' : '➕ Add New Income'}
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-3">
            <input
              className={`form-control ${errors.sourceName ? 'is-invalid' : ''}`}
              name="sourceName"
              value={form.sourceName}
              onChange={handleChange}
              placeholder="Source Name"
              required
            />
            {errors.sourceName && <div className="invalid-feedback">{errors.sourceName}</div>}
          </div>

          <div className="mb-3">
            <input
              className={`form-control ${errors.amount ? 'is-invalid' : ''}`}
              type="number"
              name="amount"
              value={form.amount}
              onChange={handleChange}
              placeholder="Amount"
              required
            />
            {errors.amount && <div className="invalid-feedback">{errors.amount}</div>}
          </div>

          <div className="mb-3">
            <input
              className={`form-control ${errors.date ? 'is-invalid' : ''}`}
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
            />
            {errors.date && <div className="invalid-feedback">{errors.date}</div>}
          </div>

          <div className="mb-3">
            <select
              className={`form-select ${errors.category ? 'is-invalid' : ''}`}
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

          <div className="mb-3">
            <textarea
              className="form-control"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Description (optional)"
              rows="2"
            />
          </div>

          <div className="d-flex gap-2">
            <button className="btn btn-success" type="submit">
              {isEditing ? 'Update Income' : 'Add Income'}
            </button>
            {isEditing && (
              <button type="button" className="btn btn-secondary" onClick={onCancelEdit}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default IncomeForm;