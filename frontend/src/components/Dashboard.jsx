import React from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import './Dashboard.css'; // Import the refined CSS for consistency

// Utility for formatting currency (Rwandan Francs)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const Dashboard = ({ data }) => {
  const chartData = data.map(evt => ({
    name: evt.name,
    Income: evt.totalIncome,
    Expense: evt.totalExpense,
    Balance: evt.balance
  }));

  // Custom tooltip for Recharts to match the minimalist theme
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip bg-white p-3 shadow-sm rounded-3">
          <p className="label fw-bold text-dark mb-1">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }} className="mb-0 small">
              {`${entry.name}: `}
              <span className="fw-semibold">{formatCurrency(entry.value)}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="container py-4">
      <h2 className="mb-5 text-center fw-bold text-dark">
        <i className="fas fa-chart-bar me-3 text-dark"></i> Event Financial Overview
      </h2>

      <div className="card shadow-sm mb-5 border-0 rounded-3">
        <div className="card-header bg-white py-3 border-0">
          <h5 className="mb-0 text-dark fw-semibold">
            <i className="fas fa-chart-line me-2 text-dark"></i> Financial Summary Chart
          </h5>
        </div>
        <div className="card-body">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="Income" fill="#333333" name="Income" />
              <Bar dataKey="Expense" fill="#666666" name="Expense" />
              <Bar dataKey="Balance" fill="#000000" name="Balance" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h3 className="mb-4 text-dark fw-bold">
        <i className="fas fa-list-alt me-2 text-dark"></i> Event Details
      </h3>
      <div className="row g-4">
        {data.length > 0 ? (
          data.map((evt) => (
            <div key={evt.id} className="col-12 col-md-6 col-lg-4">
              <div className="card shadow-sm h-100 border-0 rounded-3">
                <div className="card-body d-flex flex-column">
                  <h5 className="card-title text-dark">{evt.name}</h5>
                  <p className="card-subtitle mb-3 text-secondary small">
                    <i className="fas fa-calendar-day me-2"></i> {evt.date}
                  </p>
                  {evt.location && (
                    <p className="card-subtitle mb-3 text-secondary small">
                      <i className="fas fa-map-marker-alt me-2"></i> {evt.location}
                    </p>
                  )}
                  {evt.description && (
                    <p className="mb-3 text-secondary small">{evt.description}</p>
                  )}

                  <div className="mt-auto pt-3 border-top">
                    <p className="mb-1">
                      <strong className="text-dark">Income:</strong>{' '}
                      <span className="text-dark fw-bold">{formatCurrency(evt.totalIncome)}</span>
                    </p>
                    <p className="mb-1">
                      <strong className="text-dark">Expense:</strong>{' '}
                      <span className="text-dark fw-bold">{formatCurrency(evt.totalExpense)}</span>
                    </p>
                    <p className="mb-2">
                      <strong className="text-dark">Balance:</strong>{' '}
                      <span className="text-dark fw-bolder">
                        {formatCurrency(evt.balance)}
                      </span>
                    </p>
                  </div>
                  <div className="d-flex gap-2 mt-3">
                    <Link
                      to={`/incomes/${evt.id}`}
                      className="btn btn-outline-dark btn-sm flex-grow-1 rounded-pill"
                    >
                      <i className="fas fa-hand-holding-usd me-2"></i> Transactions
                    </Link>
                    <Link
                      to={`/expenses/${evt.id}`}
                      className="btn btn-outline-dark btn-sm flex-grow-1 rounded-pill"
                    >
                      <i className="fas fa-coins me-2"></i> Expenses
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-12 text-center py-5">
            <p className="lead text-dark">
              <i className="fas fa-box-open me-2"></i> No events found matching the criteria.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;