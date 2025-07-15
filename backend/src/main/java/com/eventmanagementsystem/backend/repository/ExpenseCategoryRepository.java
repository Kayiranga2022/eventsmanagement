package com.eventmanagementsystem.backend.repository;

import com.eventmanagementsystem.backend.entity.ExpenseCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExpenseCategoryRepository extends JpaRepository<ExpenseCategory, Long> {
}

