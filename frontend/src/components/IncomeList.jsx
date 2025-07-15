import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  getIncomesByEvent,
  createIncome,
  updateIncome,
  deleteIncome,
} from '../services/IncomeService';
import IncomeForm from './IncomeForm';

const ITEMS_PER_PAGE = 5;

const IncomeList = () => {
  const { eventId } = useParams();
  const [incomes, setIncomes] = useState([]);
  const [filteredIncomes, setFilteredIncomes] = useState([]);
  const [editingIncome, setEditingIncome] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filters state
  const [filters, setFilters] = useState({
    categoryId: '',
    amountMin: '',
    amountMax: '',
    dateFrom: '',
    dateTo: '',
    searchText: '',
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadIncomes();
  }, [eventId]);

  useEffect(() => {
    applyFilters();
  }, [filters, incomes]);

  // Reset page when filteredIncomes changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredIncomes]);

  const loadIncomes = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getIncomesByEvent(eventId);
      setIncomes(res.data);
    } catch (err) {
      setError('Failed to load incomes.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...incomes];

    // Category filter
    if (filters.categoryId) {
      filtered = filtered.filter(inc => inc.category?.id === Number(filters.categoryId));
    }

    // Amount range filter
    if (filters.amountMin) {
      filtered = filtered.filter(inc => inc.amount >= Number(filters.amountMin));
    }
    if (filters.amountMax) {
      filtered = filtered.filter(inc => inc.amount <= Number(filters.amountMax));
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(inc => inc.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(inc => inc.date <= filters.dateTo);
    }

   // Search text filter (sourceName + description)
if (filters.searchText.trim()) {
  const text = filters.searchText.toLowerCase();
  filtered = filtered.filter(inc =>
    (inc.sourceName?.toLowerCase().includes(text) || inc.description?.toLowerCase().includes(text))
  );
}


    setFilteredIncomes(filtered);
  };

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
      alert('Failed to add income');
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
      alert('Failed to update income');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteIncome = async (id) => {
    if (!window.confirm('Delete this income?')) return;
    setLoading(true);
    try {
      await deleteIncome(id);
      if (editingIncome && editingIncome.id === id) {
        setEditingIncome(null);
      }
      await loadIncomes();
    } catch (err) {
      alert('Failed to delete income');
    } finally {
      setLoading(false);
    }
  };

  // Pagination helpers
  const pageCount = Math.ceil(filteredIncomes.length / ITEMS_PER_PAGE);
  const paginatedIncomes = filteredIncomes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const changePage = (newPage) => {
    if (newPage < 1 || newPage > pageCount) return;
    setCurrentPage(newPage);
  };

  // Categories for filter dropdown (extract unique categories from incomes)
  const uniqueCategories = [...new Map(incomes.map(i => [i.category?.id, i.category])).values()].filter(Boolean);

  return (
    <div className="container py-4">
      <h3 className="text-success fw-bold mb-3">💰 Incomes for Event #{eventId}</h3>

      <IncomeForm
        eventId={eventId}
        onSubmit={editingIncome ? handleEditIncome : handleAddIncome}
        initialValues={editingIncome || {}}
        isEditing={!!editingIncome}
        onCancelEdit={() => setEditingIncome(null)}
      />

      {/* Filters */}
      <div className="card shadow-sm mb-3 p-3">
        <h5 className="mb-3">Filters & Search</h5>
        <div className="row g-2">
          <div className="col-md-3">
            <select
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

          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              placeholder="Min Amount"
              name="amountMin"
              value={filters.amountMin}
              onChange={handleFilterChange}
              min="0"
            />
          </div>

          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              placeholder="Max Amount"
              name="amountMax"
              value={filters.amountMax}
              onChange={handleFilterChange}
              min="0"
            />
          </div>

          <div className="col-md-2">
            <input
              type="date"
              className="form-control"
              name="dateFrom"
              value={filters.dateFrom}
              onChange={handleFilterChange}
              placeholder="From Date"
            />
          </div>

          <div className="col-md-2">
            <input
              type="date"
              className="form-control"
              name="dateTo"
              value={filters.dateTo}
              onChange={handleFilterChange}
              placeholder="To Date"
            />
          </div>

          <div className="col-md-3 mt-2">
            <input
              type="text"
              className="form-control"
              placeholder="Search source or notes"
              name="searchText"
              value={filters.searchText}
              onChange={handleFilterChange}
            />
          </div>

          <div className="col-md-2 mt-2">
            <button className="btn btn-secondary w-100" onClick={clearFilters}>
              Clear Filters
            </button>
          </div>
        </div>
      </div>

      {/* Loading & error */}
      {loading && <div className="alert alert-info">Loading...</div>}
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Incomes Table */}
      <div className="card shadow-sm">
        <div className="card-header bg-dark text-white fw-semibold">
          💼 All Incomes ({filteredIncomes.length})
        </div>
        <div className="table-responsive">
          <table className="table table-striped align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Source</th>
                <th>Category</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Descriptions</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedIncomes.length > 0 ? (
                paginatedIncomes.map((inc) => (
                  <tr key={inc.id}>
                    <td>{inc.sourceName}</td>
                    <td>
                      <span className="badge bg-info text-dark">
                        {inc.category?.name || '-'}
                      </span>
                    </td>
                    <td className="text-success fw-bold">${inc.amount.toFixed(2)}</td>
                    <td>{new Date(inc.date).toLocaleDateString()}</td>
                    <td>{inc.description || '-'}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-warning me-2"
                        onClick={() => setEditingIncome(inc)}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDeleteIncome(inc.id)}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center text-muted">
                    No income records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {pageCount > 1 && (
          <nav className="my-3 d-flex justify-content-center">
            <ul className="pagination mb-0">
              <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => changePage(currentPage - 1)}>
                  Previous
                </button>
              </li>
              {[...Array(pageCount)].map((_, i) => (
                <li
                  key={i}
                  className={`page-item ${currentPage === i + 1 ? 'active' : ''}`}
                >
                  <button className="page-link" onClick={() => changePage(i + 1)}>
                    {i + 1}
                  </button>
                </li>
              ))}
              <li className={`page-item ${currentPage === pageCount ? 'disabled' : ''}`}>
                <button className="page-link" onClick={() => changePage(currentPage + 1)}>
                  Next
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
