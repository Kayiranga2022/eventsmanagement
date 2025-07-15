package com.eventmanagementsystem.backend.service;

import com.eventmanagementsystem.backend.entity.IncomeCategory;
import com.eventmanagementsystem.backend.repository.IncomeCategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class IncomeCategoryService {

    @Autowired
    private IncomeCategoryRepository repository;

    public List<IncomeCategory> getAll() {
        return repository.findAll();
    }

    public IncomeCategory getById(Long id) {
        return repository.findById(id).orElse(null);
    }

    public IncomeCategory save(IncomeCategory category) {
        return repository.save(category);
    }

    public void delete(Long id) {
        repository.deleteById(id);
    }
}
