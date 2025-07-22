import React, { useEffect, useState, useCallback } from 'react';
import { getEvents } from '../services/EventService';
import { getIncomesByEvent } from '../services/IncomeService';
import { getExpensesByEvent } from '../services/ExpenseService';
import { getIncomeCategories } from '../services/incomeCategoryService';
import { getExpenseCategories } from '../services/ExpenseCategoryService';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas'; // Import html2canvas
import jsPDF from 'jspdf'; // Import jspdf
import Dashboard from '../components/Dashboard';

// Utility for formatting currency (Rwandan Francs)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-RW', {
    style: 'currency',
    currency: 'RWF',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const DashboardPage = () => {
  const [dashboardData, setDashboardData] = useState([]);
  const [totals, setTotals] = useState({ income: 0, expense: 0, balance: 0 });

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // eslint-disable-next-line no-unused-vars
  const [incomeCategories, setIncomeCategories] = useState([]);
  // eslint-disable-next-line no-unused-vars
  const [expenseCategories, setExpenseCategories] = useState([]);
  const [categoryTotals, setCategoryTotals] = useState({ incomes: {}, expenses: {} });

  const [incomeSources, setIncomeSources] = useState({});
  const [expenseSources, setExpenseSources] = useState({});

  const [filtersOpen, setFiltersOpen] = useState(false); // Start with filters collapsed

  const [expandedIncomeCategories, setExpandedIncomeCategories] = useState({});
  const [expandedExpenseCategories, setExpandedExpenseCategories] = useState({});

  const fetchCategories = useCallback(async () => {
    try {
      const incomeRes = await getIncomeCategories();
      const expenseRes = await getExpenseCategories();
      setIncomeCategories(incomeRes.data);
      setExpenseCategories(expenseRes.data);
    } catch (error) {
      console.error('Error loading categories', error);
    }
  }, []);

  const inRange = useCallback((dateStr) => {
    const time = new Date(dateStr).getTime();
    const from = startDate ? new Date(startDate).getTime() : -Infinity;
    const to = endDate ? new Date(endDate).getTime() : Infinity;
    return time >= from && time <= to;
  }, [startDate, endDate]);

  const loadDashboard = useCallback(async () => {
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
  }, [inRange]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    loadDashboard();
  }, [startDate, endDate, loadDashboard]);

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

  const handleExportPdf = () => {
    const input = document.getElementById('dashboard-content');
    if (input) {
      // Temporarily hide elements not meant for print or adjust their styles for B&W in PDF
      const elementsToHide = input.querySelectorAll('.no-print');
      elementsToHide.forEach(el => el.style.visibility = 'hidden'); // Use visibility to retain layout

      html2canvas(input, { scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210; // A4 width in mm
        const pageHeight = 297; // A4 height in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save('dashboard_summary.pdf');

        // Restore visibility after PDF generation
        elementsToHide.forEach(el => el.style.visibility = 'visible');
      });
    } else {
      console.error("Element with ID 'dashboard-content' not found for PDF export.");
    }
  };

  const handlePrint = () => {
    const content = document.getElementById('dashboard-content');
    if (content) {
      const printWindow = window.open('', '', 'height=700,width=900');
      printWindow.document.write('<html><head><title>Print Dashboard</title>');
      printWindow.document.write('<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">');
      printWindow.document.write('<style>');
      printWindow.document.write(`
        body { font-family: sans-serif; margin: 20px; color: black; background-color: white; }
        .card { border: 1px solid #ccc; margin-bottom: 20px; padding: 15px; border-radius: 8px; background-color: white; color: black; }
        .card-header { background-color: #eee !important; border-bottom: 1px solid #ccc !important; color: black !important; }
        .list-group-item { border-bottom: 1px solid #eee; padding: 10px 0; background-color: white; color: black; }
        .list-unstyled { margin-top: 10px; padding-left: 15px; }
        .list-unstyled li { margin-bottom: 5px; color: black; }
        .alert { padding: 15px; border-radius: 8px; border: 1px solid black; background-color: white; color: black; }
        .text-success { color: black !important; }
        .text-danger { color: black !important; }
        .text-muted { color: #666 !important; } /* A darker gray for muted text in print */
        .fw-semibold { font-weight: bold !important; }
        @media print {
            .no-print { display: none; }
        }
      `);
      printWindow.document.write('</style>');
      printWindow.document.write('</head><body>');
      printWindow.document.write(content.outerHTML);
      printWindow.document.write('</body></html>');
      printWindow.document.close();
      printWindow.focus();
      printWindow.print();
      printWindow.close();
    } else {
      console.error("Element with ID 'dashboard-content' not found for printing.");
    }
  };

  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen);
  };

  const toggleIncomeCategory = (cat) => {
    setExpandedIncomeCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  const toggleExpenseCategory = (cat) => {
    setExpandedExpenseCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  return (
    <div className="container py-4" id="dashboard-content">
      {/* Mobile Filters Toggle Button */}
      <button
        type="button"
        className="btn btn-outline-dark d-md-none w-100 mb-4 rounded-pill no-print"
        data-bs-toggle="modal"
        data-bs-target="#filtersModal"
      >
        <i className="fas fa-filter me-2"></i> Filter Options
      </button>

      {/* Desktop Filters Card */}
      <div className="card shadow-sm mb-4 border-0 rounded-3 d-none d-md-block no-print">
        <div
          className="card-header bg-white d-flex justify-content-between align-items-center py-3"
          onClick={toggleFilters}
          aria-expanded={filtersOpen}
          aria-controls="filtersCollapse"
          role="button"
          style={{ cursor: 'pointer', borderBottom: filtersOpen ? '1px solid #ccc' : 'none' }}
        >
          <h5 className="mb-0 text-dark fw-semibold">
            <i className="fas fa-calendar-alt me-2 text-dark"></i> Date Range Filters
          </h5>
          <i className={`fas fa-chevron-${filtersOpen ? 'up' : 'down'} text-dark`}></i>
        </div>

        <div className={`collapse ${filtersOpen ? 'show' : ''}`} id="filtersCollapse">
          <div className="card-body">
            <div className="row g-3 align-items-end">
              <div className="col-md-3">
                <label className="form-label text-dark small">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="col-md-3">
                <label className="form-label text-dark small">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="col-md-2 d-grid">
                <button
                  className="btn btn-outline-dark rounded-pill"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                >
                  <i className="fas fa-redo me-2"></i> Clear
                </button>
              </div>
              <div className="col-md-4 d-grid">
                <div className="dropdown">
                  <button
                    className="btn btn-dark rounded-pill dropdown-toggle w-100"
                    type="button"
                    id="exportDesktopDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-download me-2"></i> Export / Print
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="exportDesktopDropdown">
                    <li><button className="dropdown-item text-dark" type="button" onClick={handleExport}><i className="fas fa-file-excel me-2"></i> Export to Excel</button></li>
                    <li><button className="dropdown-item text-dark" type="button" onClick={handleExportPdf}><i className="fas fa-file-pdf me-2"></i> Export to PDF</button></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-dark" type="button" onClick={handlePrint}><i className="fas fa-print me-2"></i> Print</button></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filters Modal */}
      <div
        className="modal fade"
        id="filtersModal"
        tabIndex="-1"
        aria-labelledby="filtersModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content rounded-3">
            <div className="modal-header border-0 pb-0">
              <h5 className="modal-title text-dark fw-semibold" id="filtersModalLabel">
                <i className="fas fa-filter me-2 text-dark"></i> Filter Options
              </h5>
              <button
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body pt-0">
              <div className="mb-3">
                <label className="form-label text-dark small">Start Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="form-label text-dark small">End Date</label>
                <input
                  type="date"
                  className="form-control"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
              <div className="d-flex justify-content-between gap-2 mb-3">
                <button
                  className="btn btn-outline-dark flex-grow-1 rounded-pill"
                  onClick={() => {
                    setStartDate('');
                    setEndDate('');
                  }}
                  data-bs-dismiss="modal"
                >
                  <i className="fas fa-redo me-2"></i> Clear
                </button>
                <div className="dropdown flex-grow-1">
                  <button
                    className="btn btn-dark rounded-pill dropdown-toggle w-100"
                    type="button"
                    id="exportMobileDropdown"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                  >
                    <i className="fas fa-download me-2"></i> Export / Print
                  </button>
                  <ul className="dropdown-menu" aria-labelledby="exportMobileDropdown">
                    <li><button className="dropdown-item text-dark" type="button" onClick={() => { handleExport(); const modalEl = document.getElementById('filtersModal'); const modal = window.bootstrap.Modal.getInstance(modalEl); if (modal) modal.hide(); }}><i className="fas fa-file-excel me-2"></i> Export to Excel</button></li>
                    <li><button className="dropdown-item text-dark" type="button" onClick={() => { handleExportPdf(); const modalEl = document.getElementById('filtersModal'); const modal = window.bootstrap.Modal.getInstance(modalEl); if (modal) modal.hide(); }}><i className="fas fa-file-pdf me-2"></i> Export to PDF</button></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li><button className="dropdown-item text-dark" type="button" onClick={() => { handlePrint(); const modalEl = document.getElementById('filtersModal'); const modal = window.bootstrap.Modal.getInstance(modal); if (modal) modal.hide(); }}><i className="fas fa-print me-2"></i> Print</button></li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Totals Alert */}
      {(startDate || endDate) && (
        <div
          className={`alert bg-light text-dark d-flex justify-content-between align-items-center py-3 px-4 mb-4 border border-dark rounded-3`}
          role="alert"
          // Conditional styling for balance: using text color for emphasis instead of background color
          // The background will be light gray, text will be dark.
          style={{
            backgroundColor: totals.balance >= 0 ? '#f8f9fa' : '#e9ecef', // Light gray for positive, slightly darker for negative
            color: '#212529', // Dark text for readability
            borderColor: '#343a40', // Darker border for contrast
          }}
        >
          <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-3">
            <span className="text-dark fw-bold">Total Income: <span className="text-dark">{formatCurrency(totals.income)}</span></span>
            <span className="text-dark fw-bold">Total Expense: <span className="text-dark">{formatCurrency(totals.expense)}</span></span>
            <span className="text-dark fw-bold">Balance: <span className="text-dark fw-bolder">{formatCurrency(totals.balance)}</span></span>
          </div>
          <button className="btn-close no-print" onClick={() => setTotals({ income: 0, expense: 0, balance: 0 })} aria-label="Clear Summary"></button>
        </div>
      )}

      {/* Income and Expense Category Cards */}
      {(startDate || endDate) && (
        <div className="row mt-4 g-4">
          <div className="col-md-6">
            <div className="card shadow-sm h-100 border-0 rounded-3">
              <div className="card-header bg-white py-3 border-0">
                <h5 className="mb-0 text-dark fw-semibold">
                  <i className="fas fa-arrow-circle-down me-2 text-dark"></i> Income by Category
                </h5>
              </div>
              <ul className="list-group list-group-flush">
                {Object.entries(categoryTotals.incomes).length > 0 ? (
                  Object.entries(categoryTotals.incomes).map(([cat, total]) => (
                    <li key={cat} className="list-group-item d-flex flex-column py-3">
                      <div
                        className="d-flex justify-content-between align-items-center"
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleIncomeCategory(cat)}
                        aria-expanded={!!expandedIncomeCategories[cat]}
                      >
                        <span className="fw-bold text-dark">{cat}</span>
                        <span className="fw-bold text-dark me-2">{formatCurrency(total)}</span>
                        <i className={`fas fa-chevron-${expandedIncomeCategories[cat] ? 'up' : 'down'} text-dark small`}></i>
                      </div>
                      {expandedIncomeCategories[cat] && incomeSources[cat] && (
                        <ul className="list-unstyled ms-3 mt-2 mb-0 border-top pt-2">
                          {Object.entries(incomeSources[cat]).map(([source, amount]) => (
                            <li key={source} className="d-flex justify-content-between small text-secondary py-1">
                              <span>{source}</span>
                              <span>{formatCurrency(amount)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="list-group-item text-center text-dark py-3 fst-italic">No income data for this period.</li>
                )}
              </ul>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card shadow-sm h-100 border-0 rounded-3">
              <div className="card-header bg-white py-3 border-0">
                <h5 className="mb-0 text-dark fw-semibold">
                  <i className="fas fa-arrow-circle-up me-2 text-dark"></i> Expenses by Category
                </h5>
              </div>
              <ul className="list-group list-group-flush">
                {Object.entries(categoryTotals.expenses).length > 0 ? (
                  Object.entries(categoryTotals.expenses).map(([cat, total]) => (
                    <li key={cat} className="list-group-item d-flex flex-column py-3">
                      <div
                        className="d-flex justify-content-between align-items-center"
                        style={{ cursor: 'pointer' }}
                        onClick={() => toggleExpenseCategory(cat)}
                        aria-expanded={!!expandedExpenseCategories[cat]}
                      >
                        <span className="fw-bold text-dark">{cat}</span>
                        <span className="fw-bold text-dark me-2">{formatCurrency(total)}</span>
                        <i className={`fas fa-chevron-${expandedExpenseCategories[cat] ? 'up' : 'down'} text-dark small`}></i>
                      </div>
                      {expandedExpenseCategories[cat] && expenseSources[cat] && (
                        <ul className="list-unstyled ms-3 mt-2 mb-0 border-top pt-2">
                          {Object.entries(expenseSources[cat]).map(([desc, amount]) => (
                            <li key={desc} className="d-flex justify-content-between small text-secondary py-1">
                              <span>{desc}</span>
                              <span>{formatCurrency(amount)}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))
                ) : (
                  <li className="list-group-item text-center text-dark py-3 fst-italic">No expense data for this period.</li>
                )}
              </ul>
            </div>
          </div>
        </div>
      )}

      <Dashboard data={dashboardData} />
    </div>
  );
};

export default DashboardPage;