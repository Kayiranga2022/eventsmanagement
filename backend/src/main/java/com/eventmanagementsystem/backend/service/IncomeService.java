package com.eventmanagementsystem.backend.service;

import com.eventmanagementsystem.backend.entity.Income;
import com.eventmanagementsystem.backend.entity.IncomeCategory;
import com.eventmanagementsystem.backend.repository.IncomeCategoryRepository;
import com.eventmanagementsystem.backend.repository.IncomeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class IncomeService {

    @Autowired
    private IncomeRepository incomeRepository;

    @Autowired
    private IncomeCategoryRepository categoryRepository;

    public List<Income> getAllIncomes() {
        return incomeRepository.findAll();
    }

    public List<Income> getIncomesByEvent(Long eventId) {
        return incomeRepository.findByEventId(eventId);
    }

    public Optional<Income> getIncomeById(Long id) {
        return incomeRepository.findById(id);
    }

    public Income createIncome(Income income) {
        // Ensure valid category is fetched from DB
        if (income.getCategory() != null && income.getCategory().getId() != null) {
            Optional<IncomeCategory> category = categoryRepository.findById(income.getCategory().getId());
            category.ifPresent(income::setCategory);
        }
        return incomeRepository.save(income);
    }

    public Income updateIncome(Long id, Income updatedIncome) {
        return incomeRepository.findById(id).map(income -> {
            income.setSourceName(updatedIncome.getSourceName());
            income.setAmount(updatedIncome.getAmount());
            income.setDate(updatedIncome.getDate());
            income.setDescription(updatedIncome.getDescription());

            if (updatedIncome.getCategory() != null && updatedIncome.getCategory().getId() != null) {
                Optional<IncomeCategory> category = categoryRepository.findById(updatedIncome.getCategory().getId());
                category.ifPresent(income::setCategory);
            }

            return incomeRepository.save(income);
        }).orElse(null);
    }

    public void deleteIncome(Long id) {
        incomeRepository.deleteById(id);
    }
}
