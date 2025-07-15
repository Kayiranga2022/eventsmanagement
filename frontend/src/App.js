import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer'; // ✅ import the footer
import DashboardPage from './pages/DashboardPage';
import EventsPage from './pages/EventsPage';
import IncomesPage from './pages/IncomesPage';
import ExpensesPage from './pages/ExpensesPage';
import IncomeCategoriesPage from './pages/IncomeCategoriesPage';
import ExpenseCategoriesPage from './pages/ExpenseCategoriesPage';
import ReportDashboard from './components/ReportDashboard';

function App() {
  return (
    <Router>
      <div className="d-flex flex-column min-vh-100">
        <Navbar />
        <div className="flex-grow-1">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/events" element={<EventsPage />} />
            <Route path="/incomes/:eventId" element={<IncomesPage />} />
            <Route path="/expenses/:eventId" element={<ExpensesPage />} />
            <Route path="/income-categories" element={<IncomeCategoriesPage />} />
            <Route path="/expense-categories" element={<ExpenseCategoriesPage />} />
            <Route path="/reports" element={<ReportDashboard />} />
          </Routes>
        </div>
        <Footer /> {/* ✅ footer added here */}
      </div>
    </Router>
  );
}

export default App;
