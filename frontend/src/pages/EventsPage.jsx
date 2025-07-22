import React, { useEffect, useState } from 'react';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../services/EventService';
import EventForm from '../components/EventForm'; // Assuming this EventForm is now styled
import { Link } from 'react-router-dom';

// --- IMPORTANT: Ensure Font Awesome is installed and imported globally ---
// If you haven't already:
// 1. Install: npm install --save @fortawesome/fontawesome-free
// 2. Import in your src/index.js (or global CSS file):
//    import '@fortawesome/fontawesome-free/css/all.min.css';
// --------------------------------------------------------------------------

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const res = await getEvents();
      const responseData = res.data;

      const eventList = Array.isArray(responseData)
        ? responseData
        : Array.isArray(responseData.data)
        ? responseData.data
        : [];

      setEvents(eventList);
    } catch (error) {
      console.error('Failed to load events:', error);
      setEvents([]);
    }
  };

  const handleAddEvent = async (eventData) => {
    await createEvent(eventData);
    loadEvents();
  };

  const handleEditEvent = async (eventData) => {
    await updateEvent(editingEvent.id, eventData);
    setEditingEvent(null);
    loadEvents();
  };

  const handleDeleteEvent = async (id) => {
    if (window.confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
      await deleteEvent(id);
      loadEvents();
    }
  };

  return (
    <div className="container py-4"> {/* Increased padding for better spacing */}
      <div className="mx-auto" style={{ maxWidth: '960px' }}>
        <h3 className="mb-4 text-dark fw-bold text-center"> {/* Larger heading, darker text, bold */}
          <i className="fas fa-calendar-check me-2 text-primary"></i> Your Events Dashboard
        </h3> {/* New icon and updated text for a dashboard feel */}

        <div className="mb-4"> {/* Increased margin-bottom for spacing */}
          <EventForm
            onSubmit={editingEvent ? handleEditEvent : handleAddEvent}
            initialValues={editingEvent || {}}
            isEditing={!!editingEvent}
          />
        </div>

        <div className="card shadow-sm border-0 rounded-3"> {/* Consistent card styling */}
          <div className="card-header bg-primary text-white py-3 border-0 rounded-top-3"> {/* Primary background, more padding, rounded top corners */}
            <h5 className="mb-0 fw-semibold">
              <i className="fas fa-list me-2"></i> All Events
            </h5> {/* Professional icon and clearer title */}
          </div>
          <div className="table-responsive">
            {events.length === 0 ? (
              <div className="p-4 text-center text-muted"> {/* Centered text, more padding */}
                <i className="fas fa-box-open me-2"></i> No events found. Start by adding a new event!
              </div>
            ) : (
              <table className="table table-hover align-middle mb-0"> {/* table-hover for interaction, align-middle for vertical alignment */}
                <thead className="table-light"> {/* Light background for table header */}
                  <tr>
                    <th scope="col">Name</th> {/* Added scope */}
                    <th scope="col">Date</th>
                    <th scope="col">Location</th>
                    <th scope="col">Description</th>
                    <th scope="col" className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((evt) => (
                    <tr key={evt.id}>
                      <td>{evt.name}</td>
                      <td>{new Date(evt.date).toLocaleDateString('en-RW')}</td> {/* Formatted date */}
                      <td>
                        <span className="text-muted small">
                          {evt.location || '-'} {/* Display '-' if no location */}
                        </span>
                      </td>
                      <td>
                        <span className="text-muted small">
                          {evt.description ? evt.description.substring(0, 70) + (evt.description.length > 70 ? '...' : '') : '-'}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-primary me-2 rounded-pill" // Removed trailing comment
                          onClick={() => setEditingEvent(evt)}
                          title="Edit Event"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger me-2 rounded-pill" // Removed trailing comment
                          onClick={() => handleDeleteEvent(evt.id)}
                          title="Delete Event"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                        <Link
                          to={`/incomes/${evt.id}`}
                          className="btn btn-sm btn-outline-success me-2 rounded-pill" // Removed trailing comment
                          title="View Incomes"
                        >
                          <i className="fas fa-hand-holding-usd"></i>
                        </Link>
                        <Link
                          to={`/expenses/${evt.id}`}
                          className="btn btn-sm btn-outline-secondary rounded-pill" // Removed trailing comment
                          title="View Expenses"
                        >
                          <i className="fas fa-money-bill-wave"></i>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventsPage;