package com.eventmanagementsystem.backend.service;

import com.eventmanagementsystem.backend.entity.Expense;
import com.eventmanagementsystem.backend.entity.ExpenseCategory;
import com.eventmanagementsystem.backend.repository.ExpenseCategoryRepository;
import com.eventmanagementsystem.backend.repository.ExpenseRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ExpenseCategoryRepository categoryRepository;

    public List<Expense> getAllExpenses() {
        return expenseRepository.findAll();
    }

    public List<Expense> getExpensesByEvent(Long eventId) {
        return expenseRepository.findByEventId(eventId);
    }

    public Optional<Expense> getExpenseById(Long id) {
        return expenseRepository.findById(id);
    }

    public Expense createExpense(Expense expense) {
        // Ensure category is loaded from DB if only ID is provided
        if (expense.getCategory() != null && expense.getCategory().getId() != null) {
            Optional<ExpenseCategory> category = categoryRepository.findById(expense.getCategory().getId());
            category.ifPresent(expense::setCategory);
        }
        return expenseRepository.save(expense);
    }

    public Expense updateExpense(Long id, Expense updatedExpense) {
        return expenseRepository.findById(id).map(expense -> {
            if (updatedExpense.getCategory() != null && updatedExpense.getCategory().getId() != null) {
                Optional<ExpenseCategory> category = categoryRepository.findById(updatedExpense.getCategory().getId());
                category.ifPresent(expense::setCategory);
            }

            expense.setAmount(updatedExpense.getAmount());
            expense.setDate(updatedExpense.getDate());
            expense.setDescription(updatedExpense.getDescription());
            return expenseRepository.save(expense);
        }).orElse(null);
    }

    public void deleteExpense(Long id) {
        expenseRepository.deleteById(id);
    }
}
