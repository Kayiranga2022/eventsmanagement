import React, { useEffect, useState } from 'react';
import { getEvents, createEvent, updateEvent, deleteEvent } from '../services/EventService';
import EventForm from '../components/EventForm';
import { Link } from 'react-router-dom';

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
    if (window.confirm('Are you sure you want to delete this event?')) {
      await deleteEvent(id);
      loadEvents();
    }
  };

  return (
    <div className="container py-2">
      <div className="mx-auto" style={{ maxWidth: '960px' }}>
        <h4 className="mb-3 text-primary fw-bold text-center">🎯 Manage Events</h4>

        <div className="mb-3">
          <EventForm
            onSubmit={editingEvent ? handleEditEvent : handleAddEvent}
            initialValues={editingEvent || {}}
            isEditing={!!editingEvent}
          />
        </div>

        <div className="card shadow-sm">
          <div className="card-header bg-dark text-white fw-semibold">
            📅 Events List
          </div>
          <div className="table-responsive">
            {events.length === 0 ? (
              <p className="p-3 text-muted">No events available.</p>
            ) : (
              <table className="table table-sm table-hover align-middle m-0">
                <thead className="table-light">
                  <tr>
                    <th>Name</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Description</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((evt) => (
                    <tr key={evt.id}>
                      <td>{evt.name}</td>
                      <td>{evt.date}</td>
                      <td>{evt.location}</td>
                      <td>{evt.description}</td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-warning me-1"
                          onClick={() => setEditingEvent(evt)}
                        >
                          ✏️
                        </button>
                        <button
                          className="btn btn-sm btn-danger me-1"
                          onClick={() => handleDeleteEvent(evt.id)}
                        >
                          🗑️
                        </button>
                        <Link
                          to={`/incomes/${evt.id}`}
                          className="btn btn-sm btn-outline-success me-1"
                        >
                          💰
                        </Link>
                        <Link
                          to={`/expenses/${evt.id}`}
                          className="btn btn-sm btn-outline-secondary"
                        >
                          📉
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
