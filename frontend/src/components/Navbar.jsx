import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

const Logo = () => (
  <div style={{ display: 'flex', alignItems: 'center' }}>
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill="#1a73e8"
      xmlns="http://www.w3.org/2000/svg"
      style={{ marginRight: 8 }}
    >
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 14H5V9h14z" />
    </svg>
    <span style={{ color: '#1a73e8', fontWeight: 'bold', fontSize: '1.2rem' }}>
      EventMaster
    </span>
  </div>
);

const Navbar = () => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('bg-dark', darkMode);
    document.body.classList.toggle('text-white', darkMode);
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const linkClass = (path) =>
    `nav-link px-3 py-1 rounded ${
      location.pathname === path
        ? darkMode
          ? 'bg-light text-dark fw-semibold'
          : 'bg-white text-dark fw-semibold'
        : 'text-white'
    }`;

  return (
    <nav
      className="navbar navbar-expand-lg mb-4 shadow-sm"
      style={{
        background: darkMode
          ? 'linear-gradient(to right, #232526, #414345)'
          : 'linear-gradient(to right, #4e54c8, #009688, #6c757d)',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
      }}
    >
      <div className="container-fluid px-4">
        <Link
          className="navbar-brand d-flex align-items-center text-white fw-bold"
          to="/"
        >
          <Logo />
        </Link>

        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" style={{ filter: 'invert(1)' }}></span>
        </button>

        <div className="collapse navbar-collapse mt-2 mt-lg-0" id="navbarContent">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={linkClass('/events')} to="/events">
                📅 Events
              </Link>
            </li>
            <li className="nav-item">
              <Link className={linkClass('/income-categories')} to="/income-categories">
                💰 Income Categories
              </Link>
            </li>
            <li className="nav-item">
              <Link className={linkClass('/expense-categories')} to="/expense-categories">
                📉 Expense Categories
              </Link>
            </li>
            <li className="nav-item">
              <Link className={linkClass('/reports')} to="/reports">
                📊 Reports
              </Link>
            </li>
          </ul>

          <div className="d-flex flex-column flex-lg-row align-items-start align-items-lg-center gap-2">
            <button
              className={`btn btn-sm ${darkMode ? 'btn-light' : 'btn-dark'} me-lg-3`}
              onClick={toggleDarkMode}
            >
              {darkMode ? '🌞 Light Mode' : '🌙 Dark Mode'}
            </button>

            <span className="navbar-text text-light small d-none d-sm-inline d-lg-none">
              ↪ Manage events
            </span>
            <span className="navbar-text text-light small d-none d-lg-inline">
              ↪ Select an event to manage incomes and expenses
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
