// src/services/incomeCategoryService.js
import axios from 'axios';

const API_URL = '/api/income-categories'; // Adjust based on your backend routes

export const getIncomeCategories = () => axios.get(API_URL);

export const createIncomeCategory = (categoryData) => axios.post(API_URL, categoryData);

export const updateIncomeCategory = (id, categoryData) => axios.put(`${API_URL}/${id}`, categoryData);

export const deleteIncomeCategory = (id) => axios.delete(`${API_URL}/${id}`);
