import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  getExpensesByEvent,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../services/ExpenseService';
import ExpenseForm from './ExpenseForm';

const ITEMS_PER_PAGE = 5;

const ExpenseList = () => {
  const { eventId } = useParams();
  const [expenses, setExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [editingExpense, setEditingExpense] = useState(null);

  const [filters, setFilters] = useState({
    categoryId: '',
    amountMin: '',
    amountMax: '',
    dateFrom: '',
    dateTo: '',
    searchText: '',
  });

  const [currentPage, setCurrentPage] = useState(1);

  const loadExpenses = useCallback(async () => {
    const res = await getExpensesByEvent(eventId);
    setExpenses(res.data);
  }, [eventId]);

  const applyFilters = useCallback(() => {
    let filtered = [...expenses];

    if (filters.categoryId) {
      filtered = filtered.filter(e => e.category?.id === Number(filters.categoryId));
    }
    if (filters.amountMin) {
      filtered = filtered.filter(e => e.amount >= Number(filters.amountMin));
    }
    if (filters.amountMax) {
      filtered = filtered.filter(e => e.amount <= Number(filters.amountMax));
    }
    if (filters.dateFrom) {
      filtered = filtered.filter(e => e.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(e => e.date <= filters.dateTo);
    }
    if (filters.searchText.trim()) {
      const text = filters.searchText.toLowerCase();
      filtered = filtered.filter(e =>
        (e.description?.toLowerCase().includes(text))
      );
    }

    setFilteredExpenses(filtered);
  }, [expenses, filters]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  useEffect(() => {
    applyFilters();
  }, [loadExpenses,applyFilters]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredExpenses]);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => {
    setFilters({
      categoryId: '',
      amountMin: '',
      amountMax: '',
      dateFrom: '',
      dateTo: '',
      searchText: '',
    });
  };

  const handleAddExpense = async (data) => {
    await createExpense({ ...data, event: { id: eventId } });
    await loadExpenses();
  };

  const handleEditExpense = async (data) => {
    await updateExpense(editingExpense.id, { ...data, event: { id: eventId } });
    setEditingExpense(null);
    await loadExpenses();
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Delete this expense?')) {
      await deleteExpense(id);
      if (editingExpense?.id === id) setEditingExpense(null);
      await loadExpenses();
    }
  };

  const pageCount = Math.ceil(filteredExpenses.length / ITEMS_PER_PAGE);
  const paginatedExpenses = filteredExpenses.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > pageCount) return;
    setCurrentPage(newPage);
  };

  const uniqueCategories = [...new Map(expenses.map(e => [e.category?.id, e.category])).values()].filter(Boolean);

  return (
    <div className="container py-3" style={{ maxWidth: '960px' }}>
      <h5 className="mb-3 text-danger fw-bold">📉 Expenses for Event #{eventId}</h5>

      <ExpenseForm
        eventId={eventId}
        onSubmit={editingExpense ? handleEditExpense : handleAddExpense}
        initialValues={editingExpense || {}}
        isEditing={!!editingExpense}
      />

      {/* Filters */}
      <div className="card shadow-sm mb-3 p-3">
        <h6 className="fw-semibold mb-3">Filters & Search</h6>
        <div className="row g-2">
          <div className="col-md-3">
            <select className="form-select" name="categoryId" value={filters.categoryId} onChange={handleFilterChange}>
              <option value="">All Categories</option>
              {uniqueCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div className="col-md-2">
            <input className="form-control" type="number" name="amountMin" value={filters.amountMin} onChange={handleFilterChange} placeholder="Min Amount" />
          </div>
          <div className="col-md-2">
            <input className="form-control" type="number" name="amountMax" value={filters.amountMax} onChange={handleFilterChange} placeholder="Max Amount" />
          </div>
          <div className="col-md-2">
            <input className="form-control" type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} />
          </div>
          <div className="col-md-2">
            <input className="form-control" type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} />
          </div>
          <div className="col-md-3 mt-2">
            <input className="form-control" type="text" name="searchText" value={filters.searchText} onChange={handleFilterChange} placeholder="Search by description" />
          </div>
          <div className="col-md-2 mt-2">
            <button className="btn btn-secondary w-100" onClick={clearFilters}>Clear Filters</button>
          </div>
        </div>
      </div>

      <div className="card shadow-sm mt-3">
        <div className="card-header bg-danger text-white py-2 px-3 small fw-semibold">
          💸 Expense Records ({filteredExpenses.length})
        </div>
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle mb-0">
            <thead className="table-light small">
              <tr>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Description</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedExpenses.length > 0 ? (
                paginatedExpenses.map((exp) => (
                  <tr key={exp.id} className="small">
                    <td>{exp.category?.name || '-'}</td>
                    <td className="text-danger fw-semibold">${exp.amount}</td>
                    <td>{new Date(exp.date).toLocaleDateString()}</td>
                    <td>{exp.description || '-'}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-warning me-2" onClick={() => setEditingExpense(exp)}>✏️</button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteExpense(exp.id)}>🗑️</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-3 small">No expenses found for this event.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pageCount > 1 && (
          <nav className="my-3 d-flex justify-content-center">
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => changePage(currentPage - 1)}>Previous</button>
              </li>
              {[...Array(pageCount)].map((_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => changePage(i + 1)}>{i + 1}</button>
                </li>
              ))}
              <li className={`page-item ${currentPage === pageCount ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => changePage(currentPage + 1)}>Next</button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
