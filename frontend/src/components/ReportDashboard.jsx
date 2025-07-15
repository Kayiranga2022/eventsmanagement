import React, { useState, useEffect } from 'react';
import { getEvents } from '../services/EventService';
import { getIncomesByEvent } from '../services/IncomeService';
import { getExpensesByEvent } from '../services/ExpenseService';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ['#00C49F', '#FF8042'];

const ReportDashboard = () => {
  const [events, setEvents] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const res = await getEvents();
    const data = await Promise.all(
      res.data.map(async (evt) => {
        const incomes = await getIncomesByEvent(evt.id);
        const expenses = await getExpensesByEvent(evt.id);
        const totalIncome = incomes.data.reduce((acc, i) => acc + i.amount, 0);
        const totalExpense = expenses.data.reduce((acc, e) => acc + e.amount, 0);
        return {
          id: evt.id,
          name: evt.name,
          date: evt.date,
          totalIncome,
          totalExpense,
          balance: totalIncome - totalExpense,
        };
      })
    );
    setEvents(data);
    setFilteredData(data);
  };

  const filterByDate = () => {
    if (!startDate || !endDate) return;
    const filtered = events.filter(
      (evt) => evt.date >= startDate && evt.date <= endDate
    );
    setFilteredData(filtered);
  };

  const exportToExcel = () => {
    if (!filteredData.length) return alert('No data to export!');
    const dataForSheet = [
      ['Event', 'Date', 'Income', 'Expense', 'Balance'],
      ...filteredData.map((e) => [
        e.name,
        e.date,
        e.totalIncome,
        e.totalExpense,
        e.balance,
      ]),
    ];

    // Create worksheet
    const ws = XLSX.utils.aoa_to_sheet(dataForSheet);

    // Apply column widths for styling
    ws['!cols'] = [
      { wch: 25 }, // Event
      { wch: 15 }, // Date
      { wch: 12 }, // Income
      { wch: 12 }, // Expense
      { wch: 12 }, // Balance
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Report');
    XLSX.writeFile(wb, 'event-report.xlsx');
  };

  const exportToPDF = () => {
    if (!filteredData.length) return alert('No data to export!');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'pt' });
    doc.setFontSize(14);
    doc.text('Event Financial Report', 40, 40);
    autoTable(doc, {
      startY: 60,
      head: [['Event', 'Date', 'Income', 'Expense', 'Balance']],
      body: filteredData.map((e) => [
        e.name,
        e.date,
        `$${e.totalIncome}`,
        `$${e.totalExpense}`,
        `$${e.balance}`,
      ]),
      styles: { fontSize: 10 },
      headStyles: { fillColor: [78, 84, 200] }, // match navbar blue-ish
      columnStyles: {
        2: { halign: 'right' }, // Income right align
        3: { halign: 'right' }, // Expense right align
        4: { halign: 'right' }, // Balance right align
      },
      margin: { left: 40, right: 40 },
    });
    doc.save('event-report.pdf');
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="container my-4">
      <h2 className="text-center fw-bold mb-4 text-primary">📈 Event Financial Report</h2>

      {/* Filters */}
      <div className="row mb-3">
        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <input
            type="date"
            className="form-control"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <button
            className="btn btn-outline-primary w-100"
            onClick={filterByDate}
          >
            Apply Filters
          </button>
        </div>
        <div className="col-md-3 d-flex gap-2">
          <button className="btn btn-outline-success w-100" onClick={exportToExcel}>
            Export Excel
          </button>
          <button className="btn btn-outline-danger w-100" onClick={exportToPDF}>
            Export PDF
          </button>
          <button className="btn btn-outline-dark w-100" onClick={printReport}>
            🖨 Print
          </button>
        </div>
      </div>

      {/* Charts */}
      {filteredData.map((event) => (
        <div key={event.id} className="mb-5">
          <h5 className="fw-bold">
            {event.name} ({event.date})
          </h5>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={[
                  { name: 'Income', value: event.totalIncome },
                  { name: 'Expense', value: event.totalExpense },
                ]}
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
                dataKey="value"
              >
                {COLORS.map((color, index) => (
                  <Cell key={index} fill={color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
          <p className="fw-bold mt-2">
            Balance:{' '}
            <span className={event.balance >= 0 ? 'text-success' : 'text-danger'}>
              ${event.balance}
            </span>
          </p>
        </div>
      ))}
    </div>
  );
};

export default ReportDashboard;
