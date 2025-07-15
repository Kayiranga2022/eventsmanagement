import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

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
      setError('Please enter a valid email.');
      return;
    }
    setError('');
    setEmail('');
    alert('Subscribed successfully!');
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleScroll = () => {
      setShowScroll(window.scrollY > 150);
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

  const gradientLight = 'linear-gradient(to right, #4e54c8, #009688, #6c757d)';
  const gradientDark = 'linear-gradient(to right, #232526, #414345)';

  const styles = {
    footer: {
      background: darkMode ? gradientDark : gradientLight,
      color: darkMode ? '#f8f9fa' : '#212529',
      paddingTop: '40px',
      paddingBottom: '30px',
      marginTop: '60px',
    },
    sectionTitle: {
      fontWeight: '600',
      fontSize: '16px',
      marginBottom: '12px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      cursor: 'pointer',
    },
    list: {
      listStyle: 'none',
      paddingLeft: 0,
      marginBottom: 0,
    },
    link: {
      textDecoration: 'none',
      color: darkMode ? '#e9ecef' : '#f8f9fa',
      fontSize: '14px',
    },
    smallText: {
      fontSize: '13px',
      color: darkMode ? '#adb5bd' : '#f1f1f1',
    },
    inputGroup: {
      display: 'flex',
      gap: '5px',
    },
    scrollBtn: {
      position: 'fixed',
      bottom: '25px',
      right: '25px',
      width: '42px',
      height: '42px',
      background: '#ffc107',
      borderRadius: '50%',
      border: 'none',
      color: '#000',
      fontWeight: 'bold',
      fontSize: '20px',
      boxShadow: '0 0 10px rgba(0,0,0,0.3)',
      opacity: showScroll ? 1 : 0,
      transform: showScroll ? 'translateY(0)' : 'translateY(40px)',
      transition: 'all 0.3s ease-in-out',
      zIndex: 9999,
      cursor: 'pointer',
    },
  };

  return (
    <footer style={styles.footer}>
      <div className="container">
        <div className="row gy-4">

          {/* Logo & Social */}
          <div className="col-md-4">
            <h4 className="fw-bold text-white">🎯 EventManager</h4>
            <p style={styles.smallText}>
              Plan, track, and analyze all your event incomes and expenses with ease.
              Maximize impact and stay organized.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="https://facebook.com" className="text-white fs-5"><i className="bi bi-facebook"></i></a>
              <a href="https://twitter.com" className="text-white fs-5"><i className="bi bi-twitter-x"></i></a>
              <a href="https://linkedin.com" className="text-white fs-5"><i className="bi bi-linkedin"></i></a>
              <a href="https://instagram.com" className="text-white fs-5"><i className="bi bi-instagram"></i></a>
              <a href="mailto:info@eventmanager.com" className="text-white fs-5"><i className="bi bi-envelope-fill"></i></a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="col-6 col-md-2">
            <div style={styles.sectionTitle} onClick={() => toggleAccordion('quick')}>
              Quick Links
            </div>
            {(accordion.quick || isLargeScreen) && (
              <ul style={styles.list}>
                <li><Link to="/" style={styles.link}>🏠 Dashboard</Link></li>
                <li><Link to="/events" style={styles.link}>📅 Events</Link></li>
                <li><Link to="/income-categories" style={styles.link}>💰 Income Categories</Link></li>
                <li><Link to="/expense-categories" style={styles.link}>📉 Expense Categories</Link></li>
              </ul>
            )}
          </div>

          {/* Info */}
          <div className="col-6 col-md-2">
            <div style={styles.sectionTitle} onClick={() => toggleAccordion('info')}>
              Info
            </div>
            {(accordion.info || isLargeScreen) && (
              <ul style={styles.list}>
                <li><Link to="#" style={styles.link}>📄 Privacy Policy</Link></li>
                <li><Link to="#" style={styles.link}>🔐 Terms & Conditions</Link></li>
                <li><Link to="#" style={styles.link}>❓ FAQs</Link></li>
                <li><Link to="#" style={styles.link}>📧 Support</Link></li>
              </ul>
            )}
          </div>

          {/* Contact */}
          <div className="col-6 col-md-2">
            <div style={styles.sectionTitle} onClick={() => toggleAccordion('contact')}>
              Contact
            </div>
            {(accordion.contact || isLargeScreen) && (
              <ul style={styles.list}>
                <li style={styles.smallText}><i className="bi bi-geo-alt-fill me-2"></i> Kigali, Rwanda</li>
                <li style={styles.smallText}><i className="bi bi-envelope-fill me-2"></i> manager@gmail.com</li>
                <li style={styles.smallText}><i className="bi bi-phone-fill me-2"></i> +250 782 687 241</li>
                <li style={styles.smallText}><i className="bi bi-clock-fill me-2"></i> Mon - Fri: 9:00 - 17:00</li>
              </ul>
            )}
          </div>

          {/* Newsletter */}
          <div className="col-6 col-md-2">
            <div style={styles.sectionTitle} onClick={() => toggleAccordion('newsletter')}>
              Newsletter
            </div>
            {(accordion.newsletter || isLargeScreen) && (
              <>
                <p style={styles.smallText}>Stay updated with our latest news and features.</p>
                <form onSubmit={handleSubscribe}>
                  <div style={styles.inputGroup}>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                    <button className="btn btn-warning btn-sm" type="submit">Go</button>
                  </div>
                  {error && <div className="text-danger small mt-1">{error}</div>}
                </form>
              </>
            )}
          </div>
        </div>

        <hr className="my-3 border-white" />
        <div className="text-center small" style={{ color: darkMode ? '#adb5bd' : '#f1f1f1' }}>
          &copy; {currentYear} EventManager. Built with ❤️ by Kayiranga Ernest.
        </div>
      </div>

      {/* Scroll-to-top button */}
      <button
        onClick={scrollToTop}
        style={styles.scrollBtn}
        title="Scroll to top"
        aria-label="Scroll to top"
      >
        ↑
      </button>
    </footer>
  );
};

export default Footer;
