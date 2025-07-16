import React, { useEffect, useState } from 'react';
import { getEvents } from '../services/EventService';
import { getIncomesByEvent } from '../services/IncomeService';
import { getExpensesByEvent } from '../services/ExpenseService';
//import { getIncomeCategories } from '../services/incomeCategoryService';
//import { getExpenseCategories } from '../services/ExpenseCategoryService';
import * as XLSX from 'xlsx';
import Dashboard from '../components/Dashboard';

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0 });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const [incomeCategories, setIncomeCategories] = useState([]);
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState({ incomes: {}, expenses: {} });

  const [incomeSources, setIncomeSources] = useState({});
  const [expenseSources, setExpenseSources] = useState({});

  const [filtersOpen, setFiltersOpen] = useState(true);

  // Track which categories are expanded to show sources
  const [expandedIncomeCategories, setExpandedIncomeCategories] = useState({});
  const [expandedExpenseCategories, setExpandedExpenseCategories] = useState({});

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [startDate, endDate]);

  const fetchCategories = async () => {
    try {
      const incomeRes = await getIncomeCategories();
      const expenseRes = await getExpenseCategories();
      setIncomeCategories(incomeRes.data);
      setExpenseCategories(expenseRes.data);
    } catch (error) {
      console.error('Error loading categories', error);
    }
  };

  const inRange = (dateStr) => {
    const time = new Date(dateStr).getTime();
    const from = startDate ? new Date(startDate).getTime() : -Infinity;
    const to = endDate ? new Date(endDate).getTime() : Infinity;
    return time >= from && time <= to;
  };

  const loadDashboard = async () => {
    try {
      const eventsResponse = await getEvents();
      const events = eventsResponse.data;

      let incomeSum = 0;
      let expenseSum = 0;
      const incomeCategoryMap = {};
      const expenseCategoryMap = {};
      const incomeSourcesMap = {};
      const expenseSourcesMap = {};

      const dataWithTotals = await Promise.all(
        events.map(async (event) => {
          try {
            const incomes = await getIncomesByEvent(event.id);
            const expenses = await getExpensesByEvent(event.id);

            const filteredIncomes = incomes.data.filter((i) => inRange(i.date));
            const filteredExpenses = expenses.data.filter((e) => inRange(e.date));

            const totalIncome = filteredIncomes.reduce((sum, income) => {
              const cat = income.category?.name || 'Uncategorized';
              const source = income.sourceName || 'Unnamed Source';

              incomeCategoryMap[cat] = (incomeCategoryMap[cat] || 0) + income.amount;

              if (!incomeSourcesMap[cat]) incomeSourcesMap[cat] = {};
              incomeSourcesMap[cat][source] = (incomeSourcesMap[cat][source] || 0) + income.amount;

              return sum + income.amount;
            }, 0);

            const totalExpense = filteredExpenses.reduce((sum, exp) => {
              const cat = exp.category?.name || 'Uncategorized';
              const source = exp.description || 'Unnamed Expense';

              expenseCategoryMap[cat] = (expenseCategoryMap[cat] || 0) + exp.amount;

              if (!expenseSourcesMap[cat]) expenseSourcesMap[cat] = {};
              expenseSourcesMap[cat][source] = (expenseSourcesMap[cat][source] || 0) + exp.amount;

              return sum + exp.amount;
            }, 0);

            const balance = totalIncome - totalExpense;

            incomeSum += totalIncome;
            expenseSum += totalExpense;

            return {
              ...event,
              totalIncome,
              totalExpense,
              balance,
            };
          } catch (err) {
            console.error(`Failed to fetch data for event ${event.id}`, err);
            return {
              ...event,
              totalIncome: 0,
              totalExpense: 0,
              balance: 0,
            };
          }
        })
      );

      setDashboardData(dataWithTotals);
      setTotals({
        income: incomeSum,
        expense: expenseSum,
        balance: incomeSum - expenseSum,
      });
      setCategoryTotals({
        incomes: incomeCategoryMap,
        expenses: expenseCategoryMap,
      });
      setIncomeSources(incomeSourcesMap);
      setExpenseSources(expenseSourcesMap);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    }
  };

  const handleExport = () => {
    const wsData = [['Category', 'Income (RWF)', 'Expense (RWF)']];
    const categories = Array.from(
      new Set([
        ...Object.keys(categoryTotals.incomes),
        ...Object.keys(categoryTotals.expenses),
      ])
    );

    categories.forEach((cat) => {
      wsData.push([
        cat,
        categoryTotals.incomes[cat]?.toFixed(2) || '0.00',
        categoryTotals.expenses[cat]?.toFixed(2) || '0.00',
      ]);
    });

    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Summary');
    XLSX.writeFile(wb, 'category_summary.xlsx');
  };

  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen);
  };

  // Toggle expand/collapse for income sources
  const toggleIncomeCategory = (cat) => {
    setExpandedIncomeCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  // Toggle expand/collapse for expense sources
  const toggleExpenseCategory = (cat) => {
    setExpandedExpenseCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  return (
    <div className="container py-4">
      <button
        type="button"
        className="btn btn-primary filters-modal-btn"
        data-bs-toggle="modal"
        data-bs-target="#filtersModal"
      >
        ⚙️ Refine Results Timely
      </button>

      <div className="filters-card d-none d-md-block">
        <div
          className="filters-title"
          onClick={toggleFilters}
          aria-expanded={filtersOpen}
          aria-controls="filtersCollapse"
          role="button"
        >
          ⚙️ Filter Events
          <span>{filtersOpen ? '▲' : '▼'}</span>
        </div>

        <div className={`collapse ${filtersOpen ? 'show' : ''}`} id="filtersCollapse">
          <div className="row g-3 align-items-end">
            <div className="col-md-3">
              <label className="form-label small">📅 Start Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label small">📆 End Date</label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="col-auto d-grid">
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
              >
                ♻ Clear
              </button>
            </div>
            <div className="col-auto d-grid">
              <button
                className="btn btn-outline-success btn-sm"
                onClick={handleExport}
              >
                ⬇ Export
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade"
        id="filtersModal"
        tabIndex="-1"
        aria-labelledby="filtersModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="filtersModalLabel">⚙️ Filter Events</h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label small">📅 Start Date</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="mb-3">
                <label className="form-label small">📆 End Date</label>
                <input
                  type="date"
                  className="form-control form-control-sm"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="d-flex justify-content-between">
                <button
                  className="btn btn-outline-secondary btn-sm"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  data-bs-dismiss="modal"
                >
                  ♻ Clear
                </button>
                <button
                  className="btn btn-outline-success btn-sm"
                  onClick={() => {
                    handleExport();
                    const modalEl = document.getElementById('filtersModal');
                    const modal = window.bootstrap.Modal.getInstance(modalEl);
                    if (modal) modal.hide();
                  }}
                >
                  ⬇ Export
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {(startDate || endDate) && (
        <div
          className={`alert ${totals.balance >= 0 ? 'alert-success' : 'alert-danger'} d-flex justify-content-between align-items-center`}
        >
          <div>
            <strong>Total Income:</strong> RWF {totals.income.toFixed(2)} &nbsp;|&nbsp;
            <strong>Total Expense:</strong> RWF {totals.expense.toFixed(2)} &nbsp;|&nbsp;
            <strong>Balance:</strong>{' '}
            <span className={totals.balance >= 0 ? 'text-success' : 'text-danger'}>
              RWF {totals.balance.toFixed(2)}
            </span>
          </div>
          <button className="btn-close" onClick={() => setTotals({ income: 0, expense: 0, balance: 0 })}></button>
        </div>
      )}

      {(startDate || endDate) && (
        <div className="mt-4">
          <h5 className="text-primary fw-bold">🔍 Income Totals by Category</h5>
          <ul className="list-group mb-3">
            {Object.entries(categoryTotals.incomes).map(([cat, total]) => (
              <li key={cat} className="list-group-item">
                <div 
                  className="d-flex justify-content-between"
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleIncomeCategory(cat)}
                  aria-expanded={!!expandedIncomeCategories[cat]}
                >
                  <span><strong>{cat}</strong></span>
                  <span className="fw-semibold text-success">RWF {total.toFixed(2)}</span>
                </div>
                {expandedIncomeCategories[cat] && incomeSources[cat] && (
                  <ul className="list-unstyled ms-3 mt-2">
                    {Object.entries(incomeSources[cat]).map(([source, amount]) => (
                      <li key={source} className="d-flex justify-content-between small text-muted">
                        <span>{source}</span>
                        <span>RWF {amount.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>

          <h5 className="text-danger fw-bold">💸 Expense Totals by Category</h5>
          <ul className="list-group">
            {Object.entries(categoryTotals.expenses).map(([cat, total]) => (
              <li key={cat} className="list-group-item">
                <div 
                  className="d-flex justify-content-between"
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleExpenseCategory(cat)}
                  aria-expanded={!!expandedExpenseCategories[cat]}
                >
                  <span><strong>{cat}</strong></span>
                  <span className="fw-semibold text-danger">RWF {total.toFixed(2)}</span>
                </div>
                {expandedExpenseCategories[cat] && expenseSources[cat] && (
                  <ul className="list-unstyled ms-3 mt-2">
                    {Object.entries(expenseSources[cat]).map(([desc, amount]) => (
                      <li key={desc} className="d-flex justify-content-between small text-muted">
                        <span>{desc}</span>
                        <span>RWF {amount.toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      <Dashboard data={dashboardData} />
    </div>
  );
};

export default DashboardPage;
