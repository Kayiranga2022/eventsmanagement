package com.eventmanagementsystem.backend.controller;

import com.eventmanagementsystem.backend.entity.IncomeCategory;
import com.eventmanagementsystem.backend.service.IncomeCategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/income-categories")
@CrossOrigin
public class IncomeCategoryController {

    @Autowired
    private IncomeCategoryService service;

    @GetMapping
    public List<IncomeCategory> getAll() {
        return service.getAll();
    }

    @GetMapping("/{id}")
    public IncomeCategory getById(@PathVariable Long id) {
        return service.getById(id);
    }

    @PostMapping
    public IncomeCategory create(@RequestBody IncomeCategory category) {
        return service.save(category);
    }

    @PutMapping("/{id}")
    public IncomeCategory update(@PathVariable Long id, @RequestBody IncomeCategory updated) {
        updated.setId(id);
        return service.save(updated);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        service.delete(id);
    }
}
