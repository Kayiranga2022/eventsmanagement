package com.eventmanagementsystem.backend.controller;

import com.eventmanagementsystem.backend.entity.ExpenseCategory;
import com.eventmanagementsystem.backend.service.ExpenseCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/expense-categories")
@CrossOrigin
public class ExpenseCategoryController {

    @Autowired
    private ExpenseCategoryService service;

    @GetMapping
    public List<ExpenseCategory> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public ExpenseCategory getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public ExpenseCategory create(@RequestBody ExpenseCategory category) {
        return service.save(category);
    }

    @PutMapping("/{id}")
    public ExpenseCategory update(@PathVariable Long id, @RequestBody ExpenseCategory updated) {
        updated.setId(id);
        return service.save(updated);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
