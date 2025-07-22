import React from 'react';
import ReactDOM from 'react-dom/client';

// 1. Import Bootstrap CSS FIRST
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css'; // If you're using Bootstrap Icons, keep this after core Bootstrap CSS
import '@fortawesome/fontawesome-free/css/all.min.css'; // Import Font Awesome after Bootstrap CSS as well

// 2. Then, import your custom global CSS (which is now confirmed to be minimal)
import './index.css';

import App from './App';
import reportWebVitals from './reportWebVitals';

// 3. Bootstrap JS bundle LAST (after all CSS and components are loaded)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();