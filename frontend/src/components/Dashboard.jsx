import React from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import './Dashboard.css';

const Dashboard = ({ data }) => {
  const chartData = data.map(evt => ({
    name: evt.name,
    Income: evt.totalIncome,
    Expense: evt.totalExpense,
    Balance: evt.balance
  }));

  return (
    <div className="container py-4">
      <h2 className="mb-4 text-center fw-bold text-primary">📊 Event Financial Dashboard</h2>

      <div className="mb-5">
        <h5 className="fw-semibold mb-3">💹 Summary Chart</h5>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Income" fill="#28a745" />
            <Bar dataKey="Expense" fill="#dc3545" />
            <Bar dataKey="Balance" fill="#ffc107" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="row g-4">
        {data.map((evt) => (
          <div key={evt.id} className="col-12 col-md-6 col-lg-4">
            <div className="card shadow-sm h-100">
              <div className="card-body">
                <h5 className="card-title text-secondary">{evt.name}</h5>
                <p className="card-subtitle mb-2 text-muted">📅 {evt.date}</p>
                <div className="mt-3">
                  <p className="mb-1"><strong className="text-success">Income:</strong> RWF {evt.totalIncome}</p>
                  <p className="mb-1"><strong className="text-danger">Expense:</strong> RWF {evt.totalExpense}</p>
                  <p className="mb-2">
                    <strong className="text-dark">Balance:</strong>{' '}
                    <span className={evt.balance >= 0 ? 'text-success' : 'text-danger'}>
                      RWF {evt.balance}
                    </span>
                  </p>
                </div>
                <div className="d-flex gap-2">
                  <Link to={`/incomes/${evt.id}`} className="btn btn-sm btn-outline-success w-50">Incomes</Link>
                  <Link to={`/expenses/${evt.id}`} className="btn btn-sm btn-outline-secondary w-50">Expenses</Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
