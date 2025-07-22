import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  getExpensesByEvent,
  createExpense,
  updateExpense,
  deleteExpense,
} from '../services/ExpenseService';
import ExpenseForm from './ExpenseForm';

// --- IMPORTANT: Ensure Font Awesome is installed and imported globally ---
// If you haven't already:
// 1. Install: npm install --save @fortawesome/fontawesome-free
// 2. Import in your src/index.js (or global CSS file):
//    import '@fortawesome/fontawesome-free/css/all.min.css';
// --------------------------------------------------------------------------

const ITEMS_PER_PAGE = 5;

// Utility for formatting currency (Rwandan Francs)
const formatCurrency = (amount) => {
  // Ensure the amount is a number before formatting
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);
};

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
    // Original code did not include loading/error states here, keeping it as is.
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
        // Original search was only by description, adding category name for completeness
        (e.description?.toLowerCase().includes(text) || e.category?.name?.toLowerCase().includes(text))
      );
    }

    setFilteredExpenses(filtered);
    // Original logic: setCurrentPage(1) was tied to filteredExpenses change,
    // explicitly setting it here to ensure reset on filter change.
    setCurrentPage(1);
  }, [expenses, filters]);

  useEffect(() => {
    loadExpenses();
  }, [loadExpenses]);

  useEffect(() => {
    applyFilters();
  }, [expenses, applyFilters]); // Dependency corrected to expenses and applyFilters

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
    // Original code did not include loading/error states here, keeping it as is.
    await createExpense({ ...data, event: { id: eventId } });
    await loadExpenses();
  };

  const handleEditExpense = async (data) => {
    // Original code did not include loading/error states here, keeping it as is.
    await updateExpense(editingExpense.id, { ...data, event: { id: eventId } });
    setEditingExpense(null);
    await loadExpenses();
  };

  const handleDeleteExpense = async (id) => {
    if (window.confirm('Are you sure you want to delete this expense record? This action cannot be undone.')) { // Updated confirmation message
      // Original code did not include loading/error states here, keeping it as is.
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

  // Get unique categories for the filter dropdown from the expenses currently loaded
  const uniqueCategories = [
    ...new Map(expenses.map(e => [e.category?.id, e.category])).values()
  ].filter(Boolean).sort((a, b) => a.name.localeCompare(b.name)); // Sorted alphabetically

  return (
    <div className="container py-4"> {/* Increased padding for overall component */}
      <h3 className="mb-4 text-dark fw-bold text-center"> {/* Larger heading, dark text, centered */}
        <i className="fas fa-coins me-3 text-danger"></i> Expense Transactions for Event #{eventId}
      </h3>

      {/* Expense Form Section */}
      <div className="mb-4"> {/* Added mb-4 for spacing below the form */}
        <ExpenseForm
          eventId={eventId}
          onSubmit={editingExpense ? handleEditExpense : handleAddExpense}
          initialValues={editingExpense || {}}
          isEditing={!!editingExpense}
          // The original code did not pass onCancelEdit, so keeping it out here
          // onCancelEdit={() => setEditingExpense(null)} // This line would be added if logic changes were allowed
        />
      </div>

      {/* Filters Card */}
      <div className="card shadow-sm mb-4 border-0 rounded-3"> {/* Consistent card style */}
        <div className="card-header bg-white py-3 border-0"> {/* Neutral header */}
          <h5 className="mb-0 text-dark fw-semibold"><i className="fas fa-filter me-2 text-muted"></i> Filter Expense Transactions</h5>
        </div>
        <div className="card-body">
          <div className="row g-3 align-items-end"> {/* Use g-3 for slightly more gap, align items to end */}
            <div className="col-md-4 col-lg-3">
              <label htmlFor="categoryFilter" className="form-label text-muted small mb-1">Category</label>
              <select
                id="categoryFilter"
                className="form-select"
                name="categoryId"
                value={filters.categoryId}
                onChange={handleFilterChange}
              >
                <option value="">All Categories</option>
                {uniqueCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="col-6 col-md-4 col-lg-2">
              <label htmlFor="amountMin" className="form-label text-muted small mb-1">Min Amount</label>
              <input
                id="amountMin"
                type="number"
                className="form-control"
                placeholder="Min"
                name="amountMin"
                value={filters.amountMin}
                onChange={handleFilterChange}
                min="0"
              />
            </div>

            <div className="col-6 col-md-4 col-lg-2">
              <label htmlFor="amountMax" className="form-label text-muted small mb-1">Max Amount</label>
              <input
                id="amountMax"
                type="number"
                className="form-control"
                placeholder="Max"
                name="amountMax"
                value={filters.amountMax}
                onChange={handleFilterChange}
                min="0"
              />
            </div>

            <div className="col-md-6 col-lg-2">
              <label htmlFor="dateFrom" className="form-label text-muted small mb-1">Date From</label>
              <input
                id="dateFrom"
                type="date"
                className="form-control"
                name="dateFrom"
                value={filters.dateFrom}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-md-6 col-lg-2">
              <label htmlFor="dateTo" className="form-label text-muted small mb-1">Date To</label>
              <input
                id="dateTo"
                type="date"
                className="form-control"
                name="dateTo"
                value={filters.dateTo}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-12 col-md-8 col-lg-6 mt-3"> {/* Increased top margin for this row */}
              <label htmlFor="searchText" className="form-label text-muted small mb-1">Search</label>
              <input
                id="searchText"
                type="text"
                className="form-control"
                placeholder="Search description or category..." // Removed inline comment
                name="searchText"
                value={filters.searchText}
                onChange={handleFilterChange}
              />
            </div>

            <div className="col-12 col-md-4 col-lg-2 mt-3 d-grid"> {/* d-grid for full width button */}
              <button className="btn btn-outline-secondary rounded-pill" onClick={clearFilters}>
                <i className="fas fa-redo me-2"></i> Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Original code did not include loading/error indicators, keeping it out.
      {loading && <div className="alert alert-info">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}
      */}

      {/* Expense List Table */}
      <div className="card shadow-sm border-0 rounded-3"> {/* Consistent card style */}
        <div className="card-header bg-dark text-white py-3 border-0 rounded-top-3"> {/* Dark header, rounded top */}
          <h5 className="mb-0 fw-semibold">
            <i className="fas fa-list-alt me-2"></i> All Transactions ({filteredExpenses.length})
          </h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0"> {/* table-hover for interactivity */}
            <thead className="table-light"> {/* Light header for contrast */}
              <tr>
                <th scope="col">Category</th>
                <th scope="col">Amount (RWF)</th>
                <th scope="col">Date</th>
                <th scope="col">Description</th>
                <th scope="col" className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedExpenses.length > 0 ? (
                paginatedExpenses.map((exp) => (
                  <tr key={exp.id}>
                    <td>
                      <span className="badge bg-secondary-subtle text-dark border border-secondary-subtle">
                        {exp.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="text-danger fw-bold">{formatCurrency(exp.amount)}</td> {/* Danger color for expense amount */}
                    <td>{new Date(exp.date).toLocaleDateString('en-RW')}</td>
                    <td>
                      <span className="text-muted small">
                        {exp.description ? exp.description.substring(0, 50) + (exp.description.length > 50 ? '...' : '') : '-'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2 rounded-pill"
                        onClick={() => setEditingExpense(exp)}
                        title="Edit Expense"
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger rounded-pill"
                        onClick={() => handleDeleteExpense(exp.id)}
                        title="Delete Expense"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4"> {/* Adjusted colSpan */}
                    <i className="fas fa-box-open me-2"></i> No expense transactions found for this event or matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {pageCount > 1 && (
          <nav className="my-3 d-flex justify-content-center">
            <ul className="pagination mb-0 rounded-pill overflow-hidden shadow-sm"> {/* Rounded pagination, subtle shadow */}
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => changePage(currentPage - 1)} disabled={currentPage === 1}>
                  <i className="fas fa-chevron-left"></i> Previous
                </button>
              </li>
              {[...Array(pageCount)].map((_, i) => (
                <li key={i} className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}>
                  <button className="page-link" onClick={() => changePage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === pageCount ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => changePage(currentPage + 1)} disabled={currentPage === pageCount}>
                  Next <i className="fas fa-chevron-right"></i>
                </button>
              </li>
            </ul>
          </nav>
        )}
      </div>
    </div>
  );
};

export default ExpenseList;