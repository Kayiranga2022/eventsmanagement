import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import {
  getIncomesByEvent,
  createIncome,
  updateIncome,
  deleteIncome,
} from '../services/IncomeService';
import IncomeForm from './IncomeForm';

// --- IMPORTANT: Ensure Font Awesome is installed and imported globally ---
// If you haven't already:
// 1. Install: npm install --save @fortawesome/fontawesome-free
// 2. Import in your src/index.js (or global CSS file):
//    import '@fortawesome/fontawesome-free/css/all.min.css';
// --------------------------------------------------------------------------

const ITEMS_PER_PAGE = 5;

// Utility for formatting currency (Rwandan Francs)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const IncomeList = () => {
  const { eventId } = useParams();
  const [incomes, setIncomes] = useState([]);
  const [filteredIncomes, setFilteredIncomes] = useState([]);
  const [editingIncome, setEditingIncome] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [filters, setFilters] = useState({
    categoryId: '',
    amountMin: '',
    amountMax: '',
    dateFrom: '',
    dateTo: '',
    searchText: '',
  });

  const [currentPage, setCurrentPage] = useState(1);

  const loadIncomes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getIncomesByEvent(eventId);
      setIncomes(res.data);
    } catch (err) {
      setError('Failed to load incomes. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const applyFilters = useCallback(() => {
    let filtered = [...incomes];

    if (filters.categoryId) {
      filtered = filtered.filter(inc => inc.category?.id === Number(filters.categoryId));
    }

    if (filters.amountMin) {
      filtered = filtered.filter(inc => inc.amount >= Number(filters.amountMin));
    }
    if (filters.amountMax) {
      filtered = filtered.filter(inc => inc.amount <= Number(filters.amountMax));
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(inc => inc.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(inc => inc.date <= filters.dateTo);
    }

    if (filters.searchText.trim()) {
      const text = filters.searchText.toLowerCase();
      filtered = filtered.filter(inc =>
        (inc.sourceName?.toLowerCase().includes(text) || inc.description?.toLowerCase().includes(text) || inc.category?.name?.toLowerCase().includes(text))
      );
    }

    setFilteredIncomes(filtered);
    setCurrentPage(1); // Reset to first page on filter change
  }, [incomes, filters]);

  useEffect(() => {
    loadIncomes();
  }, [loadIncomes]);

  useEffect(() => {
    applyFilters();
  }, [incomes, applyFilters]); // Re-run filters when incomes or filters change

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

  const handleAddIncome = async (incomeData) => {
    setLoading(true);
    try {
      await createIncome({ ...incomeData, event: { id: eventId } });
      await loadIncomes();
    } catch (err) {
      alert('Failed to add income. Please check your input and try again.');
      console.error('Add income error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditIncome = async (incomeData) => {
    if (!editingIncome) return;
    setLoading(true);
    try {
      await updateIncome(editingIncome.id, { ...incomeData, event: { id: eventId } });
      setEditingIncome(null);
      await loadIncomes();
    } catch (err) {
      alert('Failed to update income. Please try again.');
      console.error('Update income error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIncome = async (id) => {
    if (!window.confirm('Are you sure you want to delete this income record? This action cannot be undone.')) return;
    setLoading(true);
    try {
      await deleteIncome(id);
      if (editingIncome?.id === id) {
        setEditingIncome(null);
      }
      await loadIncomes();
    } catch (err) {
      alert('Failed to delete income. Please try again.');
      console.error('Delete income error:', err);
    } finally {
      setLoading(false);
    }
  };

  const pageCount = Math.ceil(filteredIncomes.length / ITEMS_PER_PAGE);
  const paginatedIncomes = filteredIncomes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > pageCount) return;
    setCurrentPage(newPage);
  };

  // Get unique categories for the filter dropdown from the incomes currently loaded
  const uniqueCategories = [
    ...new Map(incomes.map(i => [i.category?.id, i.category])).values()
  ].filter(Boolean).sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically

  return (
    <div className="container py-4">
      <h3 className="mb-4 text-dark fw-bold text-center">
        <i className="fas fa-hand-holding-usd me-3 text-success"></i> Income Transactions for Event #{eventId}
      </h3>

      {/* Income Form Section */}
      <div className="mb-4">
        <IncomeForm
          eventId={eventId}
          onSubmit={editingIncome ? handleEditIncome : handleAddIncome}
          initialValues={editingIncome || {}}
          isEditing={!!editingIncome}
          onCancelEdit={() => setEditingIncome(null)}
        />
      </div>

      {/* Filters Card */}
      <div className="card shadow-sm mb-4 border-0 rounded-3"> {/* Consistent card style */}
        <div className="card-header bg-white py-3 border-0">
          <h5 className="mb-0 text-dark fw-semibold"><i className="fas fa-filter me-2 text-muted"></i> Filter Income Transactions</h5>
        </div>
        <div className="card-body">
          <div className="row g-3 align-items-end"> {/* Use g-3 for slightly more gap */}
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
                placeholder="Search source, description or category..."
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

      {loading && (
        <div className="d-flex justify-content-center align-items-center py-5">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading incomes...</span>
          </div>
          <p className="ms-3 text-muted">Loading transactions...</p>
        </div>
      )}
      {error && (
        <div className="alert alert-danger d-flex align-items-center" role="alert">
          <i className="fas fa-exclamation-triangle me-2"></i> {error}
        </div>
      )}

      {/* Income List Table */}
      <div className="card shadow-sm border-0 rounded-3"> {/* Consistent card style */}
        <div className="card-header bg-dark text-white py-3 border-0 rounded-top-3"> {/* Dark header, rounded top */}
          <h5 className="mb-0 fw-semibold">
            <i className="fas fa-list-alt me-2"></i> All Transactions ({filteredIncomes.length})
          </h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0"> {/* table-hover for interactivity */}
            <thead className="table-light"> {/* Light header for contrast */}
              <tr>
                <th scope="col">Source</th>
                <th scope="col">Category</th>
                <th scope="col">Amount (RWF)</th>
                <th scope="col">Date</th>
                <th scope="col">Description</th>
                <th scope="col" className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedIncomes.length > 0 ? (
                paginatedIncomes.map((inc) => (
                  <tr key={inc.id}>
                    <td><span className="fw-semibold text-dark">{inc.sourceName}</span></td>
                    <td>
                      <span className="badge bg-secondary-subtle text-dark border border-secondary-subtle">
                        {inc.category?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="text-success fw-bold">{formatCurrency(inc.amount)}</td>
                    <td>{new Date(inc.date).toLocaleDateString('en-RW')}</td>
                    <td>
                      <span className="text-muted small">
                        {inc.description ? inc.description.substring(0, 50) + (inc.description.length > 50 ? '...' : '') : '-'}
                      </span>
                    </td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-primary me-2 rounded-pill"
                        onClick={() => setEditingIncome(inc)}
                        title="Edit Income"
                      >
                        <i className="fas fa-pencil-alt"></i>
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger rounded-pill"
                        onClick={() => handleDeleteIncome(inc.id)}
                        title="Delete Income"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted py-4">
                    <i className="fas fa-box-open me-2"></i> No income transactions found for this event or matching your filters.
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

export default IncomeList;