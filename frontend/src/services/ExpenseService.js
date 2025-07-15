// src/services/expenseService.js
import api from './api';

export const getExpenses = () => api.get('/expenses');

export const getExpensesByEvent = (eventId) => api.get(`/expenses/event/${eventId}`);

export const getExpense = (id) => api.get(`/expenses/${id}`);

export const createExpense = (expense) => api.post('/expenses', expense);

export const updateExpense = (id, expense) => api.put(`/expenses/${id}`, expense);

export const deleteExpense = (id) => api.delete(`/expenses/${id}`);
