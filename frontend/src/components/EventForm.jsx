import React, { useState, useEffect } from 'react';

const EventForm = ({ onSubmit, initialValues = {}, isEditing = false }) => {
  const [form, setForm] = useState({
    name: '',
    date: '',
    location: '',
    description: '',
  });

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name || '',
        date: initialValues.date || '',
        location: initialValues.location || '',
        description: initialValues.description || '',
      });
    }
  }, [initialValues]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
    setForm({ name: '', date: '', location: '', description: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded bg-light shadow-sm">
      <h4 className="mb-3 text-primary">{isEditing ? '✏️ Edit Event' : '📅 Add New Event'}</h4>

      <div className="row mb-3">
        <div className="col-md-6 mb-2">
          <label className="form-label fw-semibold">Event Name</label>
          <input
            className="form-control"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Enter event name"
            required
          />
        </div>

        <div className="col-md-6 mb-2">
          <label className="form-label fw-semibold">Date</label>
          <input
            className="form-control"
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Location</label>
        <input
          className="form-control"
          name="location"
          value={form.location}
          onChange={handleChange}
          placeholder="Enter location"
        />
      </div>

      <div className="mb-3">
        <label className="form-label fw-semibold">Description</label>
        <textarea
          className="form-control"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Write a short description..."
          rows={3}
        />
      </div>

      <button className="btn btn-primary w-100" type="submit">
        {isEditing ? '✅ Update Event' : '➕ Create Event'}
      </button>
    </form>
  );
};

export default EventForm;
