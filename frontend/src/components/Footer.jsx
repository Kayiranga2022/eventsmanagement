import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

// --- IMPORTANT: Ensure Font Awesome is installed and imported globally ---
// If you haven't already:
// 1. Install: npm install --save @fortawesome/fontawesome-free
// 2. Import in your src/index.js (or global CSS file):
//    import '@fortawesome/fontawesome-free/css/all.min.css';
// --------------------------------------------------------------------------

const Footer = ({ darkMode }) => {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [showScroll, setShowScroll] = useState(false);
  const [accordion, setAccordion] = useState({
    quick: false,
    info: false,
    contact: false,
    newsletter: false,
  });
  const [isLargeScreen, setIsLargeScreen] = useState(window.innerWidth >= 768);

  const handleSubscribe = (e) => {
    e.preventDefault();
    const isValid = /\S+@\S+\.\S+/.test(email);
    if (!isValid) {
      setError('Please enter a valid email address.');
      return;
    }
    setError('');
    setEmail('');
    alert('Thank you for subscribing to our newsletter!'); // More professional alert
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 300); // Show after more scrolling
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleAccordion = (section) => {
    setAccordion((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Removed direct inline styles for colors/gradients from JS object
  // and will use Bootstrap classes and CSS for better management.

  return (
    <footer className={`py-5 mt-5 border-top ${darkMode ? 'bg-dark text-light border-secondary' : 'bg-light text-dark border-light'}`}>
      <div className="container">
        <div className="row g-4"> {/* Increased gutter spacing */}

          {/* Logo & Description */}
          <div className="col-lg-4 col-md-12">
            <h5 className={`fw-bold mb-3 ${darkMode ? 'text-white' : 'text-primary'}`}>
              <i className="fas fa-chart-line me-2"></i> EventManager {/* Professional logo icon */}
            </h5>
            <p className={`small ${darkMode ? 'text-secondary' : 'text-muted'}`}>
              Seamlessly plan, track, and optimize your events. Empowering you to manage incomes, expenses, and impact with precision.
            </p>
            <div className="d-flex gap-3 mt-4"> {/* Increased top margin for social icons */}
              {/* Using Font Awesome for consistency */}
              <a href="https://facebook.com" className={`fs-5 ${darkMode ? 'text-white-50' : 'text-secondary'}`} aria-label="Facebook"><i className="fab fa-facebook"></i></a>
              <a href="https://twitter.com" className={`fs-5 ${darkMode ? 'text-white-50' : 'text-secondary'}`} aria-label="Twitter"><i className="fab fa-twitter"></i></a>
              <a href="https://linkedin.com" className={`fs-5 ${darkMode ? 'text-white-50' : 'text-secondary'}`} aria-label="LinkedIn"><i className="fab fa-linkedin"></i></a>
              <a href="https://instagram.com" className={`fs-5 ${darkMode ? 'text-white-50' : 'text-secondary'}`} aria-label="Instagram"><i className="fab fa-instagram"></i></a>
              <a href="mailto:info@eventmanager.com" className={`fs-5 ${darkMode ? 'text-white-50' : 'text-secondary'}`} aria-label="Email"><i className="fas fa-envelope"></i></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-lg-2 col-md-3">
            <h6 className={`fw-bold mb-3 d-flex justify-content-between align-items-center ${darkMode ? 'text-light' : 'text-dark'}`}
              onClick={() => toggleAccordion('quick')}>
              Quick Links
              {!isLargeScreen && <i className={`fas ${accordion.quick ? 'fa-chevron-up' : 'fa-chevron-down'} ms-2`}></i>}
            </h6>
            {(accordion.quick || isLargeScreen) && (
              <ul className="list-unstyled mb-0">
                <li className="mb-2"><Link to="/" className={`small text-decoration-none ${darkMode ? 'text-white-75 hover-primary' : 'text-muted hover-primary'}`}> <i className="fas fa-home me-2"></i> Dashboard</Link></li>
                <li className="mb-2"><Link to="/events" className={`small text-decoration-none ${darkMode ? 'text-white-75 hover-primary' : 'text-muted hover-primary'}`}> <i className="fas fa-calendar-alt me-2"></i> Events</Link></li>
                <li className="mb-2"><Link to="/income-categories" className={`small text-decoration-none ${darkMode ? 'text-white-75 hover-primary' : 'text-muted hover-primary'}`}> <i className="fas fa-money-check-alt me-2"></i> Income Categories</Link></li>
                <li className="mb-2"><Link to="/expense-categories" className={`small text-decoration-none ${darkMode ? 'text-white-75 hover-primary' : 'text-muted hover-primary'}`}> <i className="fas fa-chart-pie me-2"></i> Expense Categories</Link></li>
              </ul>
            )}
          </div>

          {/* Info */}
          <div className="col-6 col-lg-2 col-md-3">
            <h6 className={`fw-bold mb-3 d-flex justify-content-between align-items-center ${darkMode ? 'text-light' : 'text-dark'}`}
              onClick={() => toggleAccordion('info')}>
              Information
              {!isLargeScreen && <i className={`fas ${accordion.info ? 'fa-chevron-up' : 'fa-chevron-down'} ms-2`}></i>}
            </h6>
            {(accordion.info || isLargeScreen) && (
              <ul className="list-unstyled mb-0">
                <li className="mb-2"><Link to="#" className={`small text-decoration-none ${darkMode ? 'text-white-75 hover-primary' : 'text-muted hover-primary'}`}> <i className="fas fa-shield-alt me-2"></i> Privacy Policy</Link></li>
                <li className="mb-2"><Link to="#" className={`small text-decoration-none ${darkMode ? 'text-white-75 hover-primary' : 'text-muted hover-primary'}`}> <i className="fas fa-file-contract me-2"></i> Terms & Conditions</Link></li>
                <li className="mb-2"><Link to="#" className={`small text-decoration-none ${darkMode ? 'text-white-75 hover-primary' : 'text-muted hover-primary'}`}> <i className="fas fa-question-circle me-2"></i> FAQs</Link></li>
                <li className="mb-2"><Link to="#" className={`small text-decoration-none ${darkMode ? 'text-white-75 hover-primary' : 'text-muted hover-primary'}`}> <i className="fas fa-life-ring me-2"></i> Support</Link></li>
              </ul>
            )}
          </div>

          {/* Contact */}
          <div className="col-6 col-lg-2 col-md-3">
            <h6 className={`fw-bold mb-3 d-flex justify-content-between align-items-center ${darkMode ? 'text-light' : 'text-dark'}`}
              onClick={() => toggleAccordion('contact')}>
              Contact Us
              {!isLargeScreen && <i className={`fas ${accordion.contact ? 'fa-chevron-up' : 'fa-chevron-down'} ms-2`}></i>}
            </h6>
            {(accordion.contact || isLargeScreen) && (
              <ul className="list-unstyled mb-0">
                <li className={`small mb-2 ${darkMode ? 'text-white-75' : 'text-muted'}`}><i className="fas fa-map-marker-alt me-2"></i> Kigali, Rwanda</li>
                <li className={`small mb-2 ${darkMode ? 'text-white-75' : 'text-muted'}`}><i className="fas fa-envelope me-2"></i> info@eventmanager.com</li> {/* Changed email */}
                <li className={`small mb-2 ${darkMode ? 'text-white-75' : 'text-muted'}`}><i className="fas fa-phone-alt me-2"></i> +250 782 687 241</li>
                <li className={`small mb-2 ${darkMode ? 'text-white-75' : 'text-muted'}`}><i className="fas fa-clock me-2"></i> Mon - Fri: 9:00 - 17:00</li>
              </ul>
            )}
          </div>

          {/* Newsletter */}
          <div className="col-6 col-lg-2 col-md-3">
            <h6 className={`fw-bold mb-3 d-flex justify-content-between align-items-center ${darkMode ? 'text-light' : 'text-dark'}`}
              onClick={() => toggleAccordion('newsletter')}>
              Newsletter
              {!isLargeScreen && <i className={`fas ${accordion.newsletter ? 'fa-chevron-up' : 'fa-chevron-down'} ms-2`}></i>}
            </h6>
            {(accordion.newsletter || isLargeScreen) && (
              <>
                <p className={`small ${darkMode ? 'text-secondary' : 'text-muted'} mb-3`}>Stay updated with our latest news and features.</p>
                <form onSubmit={handleSubscribe}>
                  <div className="input-group mb-2">
                    <input
                      type="email"
                      className={`form-control form-control-sm ${darkMode ? 'bg-dark text-light border-secondary' : ''}`}
                      placeholder="Your email address" // More descriptive placeholder
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <button className="btn btn-primary btn-sm" type="submit"> {/* Changed to primary color */}
                      <i className="fas fa-paper-plane"></i> {/* Professional send icon */}
                    </button>
                  </div>
                  {error && <div className="text-danger small">{error}</div>}
                </form>
              </>
            )}
          </div>
        </div>

        <hr className={`my-4 ${darkMode ? 'border-secondary' : 'border-light'}`} /> {/* Thicker, consistent HR */}
        <div className={`text-center small ${darkMode ? 'text-secondary' : 'text-muted'}`}>
          &copy; {currentYear} EventManager. All rights reserved. Built with <i className="fas fa-heart text-danger"></i> by Kayiranga Ernest.
        </div>
      </div>

      {/* Scroll-to-top button */}
      <button
        onClick={scrollToTop}
        className={`btn btn-primary rounded-circle shadow-lg d-flex align-items-center justify-content-center ${showScroll ? 'show-scroll' : ''}`}
        title="Scroll to top"
        aria-label="Scroll to top"
        style={{
          position: 'fixed',
          bottom: '25px',
          right: '25px',
          width: '45px', // Slightly larger
          height: '45px', // Slightly larger
          zIndex: 9999,
          // Custom class for opacity/transform
        }}
      >
        <i className="fas fa-arrow-up"></i> {/* Professional arrow icon */}
      </button>

      {/* Add this CSS to your global stylesheet (e.g., App.css or index.css) */}
      <style>
        {`
        .hover-primary:hover {
          color: var(--bs-primary) !important; /* Use Bootstrap's primary color variable */
        }
        .show-scroll {
          opacity: 1;
          transform: translateY(0);
          transition: all 0.3s ease-in-out;
        }
        .btn.show-scroll { /* Ensure transition applies to the button */
          opacity: 1;
          transform: translateY(0);
          transition: all 0.3s ease-in-out;
        }
        .btn:not(.show-scroll) {
          opacity: 0;
          transform: translateY(40px);
          transition: all 0.3s ease-in-out;
        }
        `}
      </style>
    </footer>
  );
};

export default Footer;