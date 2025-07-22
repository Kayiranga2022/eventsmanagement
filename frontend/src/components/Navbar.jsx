import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';

// --- IMPORTANT: Ensure Font Awesome is installed and imported globally ---
// If you haven't already:
// 1. Install: npm install --save @fortawesome/fontawesome-free
// 2. Import in your src/index.js (or global CSS file):
//    import '@fortawesome/fontawesome-free/css/all.min.css';
// --------------------------------------------------------------------------

// Redesigned Logo component using Font Awesome and Bootstrap classes
const Logo = ({ darkMode }) => (
  <div className="d-flex align-items-center">
    <i
      className={`fas fa-cube fa-xl me-2 ${darkMode ? 'text-primary' : 'text-primary'}`} // Using fa-cube for a modern, business feel
      // Color remains primary regardless of dark mode for brand consistency
    ></i>
    <span className={`fw-bold fs-5 ${darkMode ? 'text-white' : 'text-dark'}`}> {/* Adjusted font size and color */}
      EventManager {/* Renamed from EventMaster for consistency with footer */}
    </span>
  </div>
);

const Navbar = () => {
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false); // State to manage dark mode

  // Effect to apply dark mode classes to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('bg-dark', 'text-light');
      document.body.classList.remove('bg-light', 'text-dark');
    } else {
      document.body.classList.add('bg-light', 'text-dark');
      document.body.classList.remove('bg-dark', 'text-light');
    }
    // You might want to save darkMode state to localStorage here
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  // Unified link class function for active/inactive states
  const linkClass = (path) =>
    `nav-link d-flex align-items-center gap-2 px-3 py-2 rounded-3 text-decoration-none ${
      location.pathname === path
        ? darkMode
          ? 'bg-primary text-white fw-semibold shadow-sm' // Primary background for active in dark mode
          : 'bg-primary text-white fw-semibold shadow-sm' // Primary background for active in light mode
        : darkMode
          ? 'text-white-50 hover-primary' // Lighter text for inactive, hover effect
          : 'text-dark-50 hover-primary' // Darker text for inactive, hover effect
    }`;

  return (
    <nav
      className={`navbar navbar-expand-lg ${darkMode ? 'navbar-dark bg-dark' : 'navbar-light bg-white'} mb-4 shadow-sm border-bottom`} // Consistent bg colors, shadow, border
      style={{
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
        transition: 'background-color 0.3s ease', // Smooth transition for dark mode
      }}
    >
      <div className="container-fluid px-4 py-2"> {/* Increased padding slightly */}
        <Link className="navbar-brand me-auto" to="/"> {/* Remove d-flex, Logo handles it */}
          <Logo darkMode={darkMode} /> {/* Pass darkMode to Logo for consistent styling */}
        </Link>

        {/* Toggler button for mobile */}
        <button
          className="navbar-toggler" // Removed border-0 and inline style
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarContent"
          aria-controls="navbarContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          {/* Default Bootstrap toggler icon is fine, no filter needed */}
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Navbar collapse content */}
        <div className="collapse navbar-collapse" id="navbarContent">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0 align-items-lg-center"> {/* Align items center for desktop */}
            <li className="nav-item me-lg-2"> {/* Margin between items for desktop */}
              <Link className={linkClass('/events')} to="/events">
                <i className="fas fa-calendar-alt me-2"></i> Events
              </Link>
            </li>
            <li className="nav-item me-lg-2">
              <Link className={linkClass('/income-categories')} to="/income-categories">
                <i className="fas fa-money-check-alt me-2"></i> Incomes
              </Link>
            </li>
            <li className="nav-item me-lg-2">
              <Link className={linkClass('/expense-categories')} to="/expense-categories">
                <i className="fas fa-chart-pie me-2"></i> Expenses
              </Link>
            </li>
            <li className="nav-item me-lg-3"> {/* Slightly more margin before reports/toggle */}
              <Link className={linkClass('/reports')} to="/reports">
                <i className="fas fa-chart-bar me-2"></i> Reports
              </Link>
            </li>

            {/* Dark Mode Toggle Button */}
            <li className="nav-item">
              <button
                className={`btn btn-sm rounded-pill px-3 ${darkMode ? 'btn-outline-light' : 'btn-outline-dark'}`} // Outline button for toggle
                onClick={toggleDarkMode}
                title="Toggle Dark Mode"
              >
                {darkMode ? <><i className="fas fa-sun me-2"></i> Light Mode</> : <><i className="fas fa-moon me-2"></i> Dark Mode</>}
              </button>
            </li>
          </ul>

          {/* Moved these descriptive spans to other parts of the app if needed,
              as a navbar generally shouldn't contain such detailed inline instructions.
              If they are crucial, consider placing them near the content they describe
              or in a tooltip on the relevant link.
          */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;