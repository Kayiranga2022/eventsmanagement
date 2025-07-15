// src/services/expenseCategoryService.js
import axios from 'axios';

const API_URL = '/api/expense-categories'; // Adjust as needed

export const getExpenseCategories = () => axios.get(API_URL);

export const createExpenseCategory = (categoryData) => axios.post(API_URL, categoryData);

export const updateExpenseCategory = (id, categoryData) => axios.put(`${API_URL}/${id}`, categoryData);

export const deleteExpenseCategory = (id) => axios.delete(`${API_URL}/${id}`);
