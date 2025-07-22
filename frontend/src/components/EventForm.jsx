import React, { useState, useEffect } from 'react';

// --- IMPORTANT: Ensure Font Awesome is installed and imported globally ---
// If you haven't already:
// 1. Install: npm install --save @fortawesome/fontawesome-free
// 2. Import in your src/index.js (or global CSS file):
//    import '@fortawesome/fontawesome-free/css/all.min.css';
// --------------------------------------------------------------------------

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
        // Ensure date is in YYYY-MM-DD format for input type="date"
        date: initialValues.date ? initialValues.date.split('T')[0] : '',
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
    // Replaced the direct form with a card structure for better aesthetics
    <div className="card shadow-sm mb-4 border-0 rounded-3">
      <div className="card-header bg-white py-3 border-0 d-flex align-items-center">
        <h5 className="mb-0 text-dark fw-semibold">
          {/* Professional icon with primary color */}
          <i className={`fas ${isEditing ? 'fa-edit' : 'fa-calendar-plus'} me-2 text-primary`}></i>
          {isEditing ? 'Edit Event Details' : 'Add New Event'}
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="eventName" className="form-label text-muted small mb-1">Event Name</label>
            <input
              id="eventName"
              className="form-control form-control-lg" // Larger input field
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g., Company Annual Gala"
              required
            />
          </div>

          <div className="row mb-3">
            <div className="col-md-6">
              <label htmlFor="eventDate" className="form-label text-muted small mb-1">Date</label>
              <input
                id="eventDate"
                className="form-control form-control-lg" // Larger input field
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="col-md-6">
              <label htmlFor="eventLocation" className="form-label text-muted small mb-1">Location</label>
              <input
                id="eventLocation"
                className="form-control form-control-lg" // Larger input field
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g., Kigali Convention Centre"
              />
            </div>
          </div>

          <div className="mb-4"> {/* Increased margin bottom */}
            <label htmlFor="eventDescription" className="form-label text-muted small mb-1">Description (Optional)</label>
            <textarea
              id="eventDescription"
              className="form-control" // Standard size
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Brief details about the event, its purpose, and key activities..."
              rows={4} // More rows for better description input
            />
          </div>

          <div className="d-flex gap-2 justify-content-end"> {/* Align buttons to the right, add gap */}
            {isEditing && ( // Only show cancel if editing
              <button
                type="button"
                className="btn btn-outline-secondary rounded-pill px-4" // Rounded, outlined secondary
                onClick={() => { /* Add cancel logic here if needed */ }}
              >
                <i className="fas fa-times-circle me-2"></i> Cancel
              </button>
            )}
            <button className="btn btn-primary rounded-pill px-4" type="submit"> {/* Rounded, primary button */}
              <i className={`fas ${isEditing ? 'fa-save' : 'fa-plus-circle'} me-2`}></i> {/* Dynamic icon */}
              {isEditing ? 'Update Event' : 'Create Event'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventForm;