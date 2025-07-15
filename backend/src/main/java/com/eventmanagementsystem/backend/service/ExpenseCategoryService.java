package com.eventmanagementsystem.backend.service;

import com.eventmanagementsystem.backend.entity.ExpenseCategory;
import com.eventmanagementsystem.backend.repository.ExpenseCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExpenseCategoryService {

    @Autowired
    private ExpenseCategoryRepository repository;

    public List<ExpenseCategory> getAll() {
        return repository.findAll();
    }

    public ExpenseCategory getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public ExpenseCategory save(ExpenseCategory category) {
        return repository.save(category);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}

