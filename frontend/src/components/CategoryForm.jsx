// CategoryForm.jsx
import React, { useState } from 'react';

const CategoryForm = ({ onSubmit, label }) => {
  const [name, setName] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name });
    setName('');
  };

  return (
    <form onSubmit={handleSubmit} className="mb-3">
      <label>{label}</label>
      <div className="d-flex">
        <input
          type="text"
          className="form-control me-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Category name"
          required
        />
        <button className="btn btn-primary">Add</button>
      </div>
    </form>
  );
};

export default CategoryForm;
