import React, { useState, useEffect } from 'react';
import { getEvents } from '../services/EventService';
import { getIncomesByEvent } from '../services/IncomeService';
import { getExpensesByEvent } from '../services/ExpenseService';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const ReportDashboard = () => {
  const [allTransactions, setAllTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  // Black and White shades for Pie Chart
  const PIE_COLORS = ['#333333', '#666666']; // Dark gray for Income, Mid gray for Expense

  useEffect(() => {
    loadAllTransactions();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [startDate, endDate, allTransactions]);

  const loadAllTransactions = async () => {
    try {
      const eventsRes = await getEvents();
      const eventsData = eventsRes.data;

      let transactions = [];

      for (const event of eventsData) {
        const incomesRes = await getIncomesByEvent(event.id);
        const expensesRes = await getExpensesByEvent(event.id);

        incomesRes.data.forEach(income => {
          transactions.push({
            id: `income-${income.id}`,
            eventId: event.id,
            eventName: event.name,
            type: 'Income',
            description: income.description,
            amount: income.amount,
            date: income.date,
          });
        });

        expensesRes.data.forEach(expense => {
          transactions.push({
            id: `expense-${expense.id}`,
            eventId: event.id,
            eventName: event.name,
            type: 'Expense',
            description: expense.description,
            amount: expense.amount,
            date: expense.date,
          });
        });
      }

      transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
      setAllTransactions(transactions);
    } catch (error) {
      console.error('Failed to load transaction data:', error);
    }
  };

  const applyFilters = () => {
    let currentFiltered = allTransactions;

    if (startDate && endDate) {
      currentFiltered = currentFiltered.filter(
        (transaction) =>
          transaction.date >= startDate && transaction.date <= endDate
      );
    } else if (startDate) {
        currentFiltered = currentFiltered.filter(
            (transaction) => transaction.date >= startDate
        );
    } else if (endDate) {
        currentFiltered = currentFiltered.filter(
            (transaction) => transaction.date <= endDate
        );
    }

    const incomeSum = currentFiltered
      .filter(t => t.type === 'Income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expenseSum = currentFiltered
      .filter(t => t.type === 'Expense')
      .reduce((acc, t) => acc + t.amount, 0);

    setTotalIncome(incomeSum);
    setTotalExpense(expenseSum);
    setFilteredTransactions(currentFiltered);
  };

  const clearFilters = () => {
    setStartDate('');
    setEndDate('');
  };

  const getReportPeriodTitle = () => {
    const start = startDate ? new Date(startDate).toLocaleDateString('en-RW') : 'the beginning';
    const end = endDate ? new Date(endDate).toLocaleDateString('en-RW') : 'now';
    
    if (startDate && endDate) {
        return `Filtered Data Transactions from ${start} to ${end}`;
    } else if (startDate) {
        return `Filtered Data Transactions from ${start} onwards`;
    } else if (endDate) {
        return `Filtered Data Transactions up to ${end}`;
    } else {
        return `All Transactions Report`;
    }
  };

  const exportToExcel = () => {
    if (!filteredTransactions.length) {
      return alert('No data to export!');
    }

    const reportTitle = getReportPeriodTitle();
    const dataForSheet = [
      [reportTitle],
      [],
      ['Date', 'Event Name', 'Type', 'Description', 'Amount'],
      ...filteredTransactions.map((t) => [
        t.date,
        t.eventName,
        t.type,
        t.description,
        t.amount,
      ]),
      [],
      ['Total Income', '', '', '', totalIncome],
      ['Total Expense', '', '', '', totalExpense],
      ['Net Balance', '', '', '', totalIncome - totalExpense],
    ];

    const ws = XLSX.utils.aoa_to_sheet(dataForSheet);

    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 4 } }];

    ws['!cols'] = [
      { wch: 15 },
      { wch: 25 },
      { wch: 10 },
      { wch: 40 },
      { wch: 15 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Financial Report');
    XLSX.writeFile(wb, `event-financial-report-${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  const exportToPDF = () => {
    if (!filteredTransactions.length) {
      return alert('No data to export!');
    }

    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'letter' });
    // Using shades of gray for PDF output
    const primaryTextColor = [51, 51, 51]; // Dark Gray
    const headerFillColor = [102, 102, 102]; // Mid Gray for table headers

    const reportTitle = getReportPeriodTitle();

    doc.setFontSize(18);
    doc.setTextColor(...primaryTextColor); // Apply dark gray text color
    doc.text('Event Financial Report', doc.internal.pageSize.getWidth() / 2, 60, { align: 'center' });

    doc.setFontSize(12);
    doc.text(reportTitle, doc.internal.pageSize.getWidth() / 2, 85, { align: 'center' });

    autoTable(doc, {
      startY: 110,
      head: [['Date', 'Event', 'Type', 'Description', 'Amount']],
      body: filteredTransactions.map((t) => [
        t.date,
        t.eventName,
        t.type,
        t.description,
        `${formatCurrency(t.amount)}`,
      ]),
      theme: 'grid',
      styles: {
        fontSize: 10,
        cellPadding: 5,
        valign: 'middle',
        textColor: primaryTextColor, // Ensure body text is dark gray
      },
      headStyles: {
        fillColor: headerFillColor, // Apply mid gray fill color
        textColor: 255, // White text for headers
        fontStyle: 'bold',
        halign: 'center'
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 70 },
        1: { halign: 'left', cellWidth: 100 },
        2: { halign: 'center', cellWidth: 60 },
        3: { halign: 'left', cellWidth: 180 },
        4: { halign: 'right', cellWidth: 80 },
      },
      margin: { top: 10, bottom: 10, left: 40, right: 40 },
      didDrawPage: (data) => {
        let str = 'Page ' + doc.internal.getNumberOfPages();
        doc.setFontSize(10);
        doc.setTextColor(...primaryTextColor); // Ensure footer text is dark gray
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.getHeight() - 20);
      }
    });

    const finalY = doc.autoTable.previous.finalY || 110;
    doc.setFontSize(12);
    doc.setTextColor(...primaryTextColor); // Apply dark gray text color
    doc.text(`Summary for the filtered period:`, 40, finalY + 30);
    doc.text(`Total Income: ${formatCurrency(totalIncome)}`, 40, finalY + 50);
    doc.text(`Total Expense: ${formatCurrency(totalExpense)}`, 40, finalY + 70);
    doc.text(`Net Balance: ${formatCurrency(totalIncome - totalExpense)}`, 40, finalY + 90);

    doc.save(`event-detailed-financial-report-${new Date().toISOString().slice(0,10)}.pdf`);
  };

  const printReport = () => {
    window.print();
  };

  const pieChartData = [
    { name: 'Total Income', value: totalIncome },
    { name: 'Total Expense', value: totalExpense },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-RW', {
      style: 'currency',
      currency: 'RWF',
    }).format(amount);
  };

  return (
    <div className="container py-4">
      <h3 className="mb-4 text-dark fw-bold text-center">
        <i className="fas fa-chart-line me-2 text-dark"></i> Detailed Financial Report
      </h3>

      {/* Filters & Export Options Card */}
      <div className="card shadow-sm border-0 rounded-3 mb-4">
        <div className="card-header bg-dark text-white py-3 border-0 rounded-top-3"> {/* Changed bg-primary to bg-dark */}
          <h5 className="mb-0 fw-semibold">
            <i className="fas fa-filter me-2"></i> Filter & Export Options
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3 align-items-end">
            <div className="col-md-3 col-lg-3">
              <label htmlFor="startDate" className="form-label small text-muted">Start Date</label>
              <input
                type="date"
                id="startDate"
                className="form-control form-control-sm"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div className="col-md-3 col-lg-3">
              <label htmlFor="endDate" className="form-label small text-muted">End Date</label>
              <input
                type="date"
                id="endDate"
                className="form-control form-control-sm"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
            <div className="col-md-6 col-lg-6 d-flex flex-wrap align-items-end justify-content-md-end gap-2 mt-3 mt-md-0">
              <button
                className="btn btn-dark btn-sm flex-grow-1 flex-md-grow-0" // Changed btn-primary to btn-dark
                onClick={applyFilters}
              >
                <i className="fas fa-search me-1"></i> Apply Filters
              </button>
              <button
                className="btn btn-outline-dark btn-sm flex-grow-1 flex-md-grow-0" // Changed btn-outline-secondary to btn-outline-dark
                onClick={clearFilters}
              >
                <i className="fas fa-undo me-1"></i> Clear Filters
              </button>
              <button
                className="btn btn-dark btn-sm flex-grow-1 flex-md-grow-0" // Changed btn-success to btn-dark
                onClick={exportToExcel}
                title="Export to Excel"
              >
                <i className="fas fa-file-excel me-1"></i> <span className="d-none d-md-inline">Excel</span>
              </button>
              <button
                className="btn btn-dark btn-sm flex-grow-1 flex-md-grow-0" // Changed btn-danger to btn-dark
                onClick={exportToPDF}
                title="Export to PDF"
              >
                <i className="fas fa-file-pdf me-1"></i> <span className="d-none d-md-inline">PDF</span>
              </button>
              <button
                className="btn btn-secondary btn-sm flex-grow-1 flex-md-grow-0 text-white" // Changed btn-info to btn-secondary, retained text-white
                onClick={printReport}
                title="Print Report"
              >
                <i className="fas fa-print me-1"></i> <span className="d-none d-md-inline">Print</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Section Card */}
      <div className="card shadow-sm border-0 rounded-3 mb-4">
        <div className="card-header bg-dark text-white py-3 border-0 rounded-top-3"> {/* Changed bg-secondary to bg-dark */}
          <h5 className="mb-0 fw-semibold">
            <i className="fas fa-cash-register me-2"></i> Financial Overview (Filtered Period)
          </h5>
        </div>
        <div className="card-body">
          <div className="row text-center">
            <div className="col-md-4 mb-3 mb-md-0">
              <h6 className="text-muted small">Total Income</h6>
              <h4 className="text-dark fw-bold">{formatCurrency(totalIncome)}</h4> {/* Changed text-success to text-dark */}
            </div>
            <div className="col-md-4 mb-3 mb-md-0">
              <h6 className="text-muted small">Total Expense</h6>
              <h4 className="text-dark fw-bold">{formatCurrency(totalExpense)}</h4> {/* Changed text-danger to text-dark */}
            </div>
            <div className="col-md-4">
              <h6 className="text-muted small">Net Balance</h6>
              <h4 className={totalIncome - totalExpense >= 0 ? 'text-dark fw-bold' : 'text-dark fw-bold'}> {/* Changed text-primary/danger to text-dark */}
                {formatCurrency(totalIncome - totalExpense)}
              </h4>
            </div>
          </div>
          {/* Pie Chart will only render if there's financial data */}
          {totalIncome > 0 || totalExpense > 0 ? (
            <ResponsiveContainer width="100%" height={250} className="mt-4">
              <PieChart>
                <Pie
                  data={pieChartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8" // This default fill is overridden by Cell fill
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-center text-muted mt-3">No financial data for the selected period to display in chart.</p>
          )}
        </div>
      </div>

      {/* Detailed Transactions Table Card */}
      <div className="card shadow-sm border-0 rounded-3 mb-4">
        <div className="card-header bg-dark text-white py-3 border-0 rounded-top-3"> {/* Changed bg-primary to bg-dark */}
          <h5 className="mb-0 fw-semibold">
            <i className="fas fa-list me-2"></i> All Transactions
          </h5>
        </div>
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th scope="col" style={{ width: '10%' }}>Date</th>
                <th scope="col" style={{ width: '20%' }}>Event Name</th>
                <th scope="col" style={{ width: '10%' }}>Type</th>
                <th scope="col" style={{ width: '40%' }}>Description</th>
                <th scope="col" className="text-end" style={{ width: '20%' }}>Amount (RWF)</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center text-muted py-4">
                    <i className="fas fa-info-circle me-2"></i> No transactions found for the selected period.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((t) => (
                  <tr key={t.id}>
                    <td>{t.date}</td>
                    <td>{t.eventName}</td>
                    <td>
                      <span className={`badge ${t.type === 'Income' ? 'bg-dark' : 'bg-secondary'}`}> {/* Changed badge colors */}
                        {t.type}
                      </span>
                    </td>
                    <td>{t.description}</td>
                    <td className={`text-end fw-medium ${t.type === 'Income' ? 'text-dark' : 'text-dark'}`}> {/* Changed text-success/danger to text-dark */}
                      {formatCurrency(t.amount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {filteredTransactions.length > 0 && (
          <div className="card-footer text-end fw-bold">
            Overall Net Balance: <span className={'text-dark'}>{formatCurrency(totalIncome - totalExpense)}</span> {/* Changed text-primary/danger to text-dark */}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportDashboard;