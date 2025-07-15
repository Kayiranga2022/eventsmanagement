package com.eventmanagementsystem.backend.controller;

import com.eventmanagementsystem.backend.entity.Income;
import com.eventmanagementsystem.backend.service.IncomeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/incomes")
@CrossOrigin
public class IncomeController {

    @Autowired
    private IncomeService incomeService;

    @GetMapping
    public List<Income> getAllIncomes() {
        return incomeService.getAllIncomes();
    }

    @GetMapping("/event/{eventId}")
    public List<Income> getIncomesByEvent(@PathVariable Long eventId) {
        return incomeService.getIncomesByEvent(eventId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Income> getIncomeById(@PathVariable Long id) {
        Optional<Income> inc = incomeService.getIncomeById(id);
        return inc.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<Income> createIncome(@RequestBody Income income) {
        // income.getCategory().getId() should be set by the client
        Income saved = incomeService.createIncome(income);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Income> updateIncome(@PathVariable Long id,
                                               @RequestBody Income income) {
        Income updated = incomeService.updateIncome(id, income);
        return updated != null
                ? ResponseEntity.ok(updated)
                : ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIncome(@PathVariable Long id) {
        incomeService.deleteIncome(id);
        return ResponseEntity.noContent().build();
    }
}
