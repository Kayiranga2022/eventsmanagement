// src/services/incomeService.js
import api from './api';

export const getIncomes = () => api.get('/incomes');

export const getIncomesByEvent = (eventId) => api.get(`/incomes/event/${eventId}`);

export const getIncome = (id) => api.get(`/incomes/${id}`);

export const createIncome = (income) => api.post('/incomes', income);

export const updateIncome = (id, income) => api.put(`/incomes/${id}`, income);

export const deleteIncome = (id) => api.delete(`/incomes/${id}`);
