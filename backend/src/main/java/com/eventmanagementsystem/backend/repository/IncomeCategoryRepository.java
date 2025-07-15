package com.eventmanagementsystem.backend.repository;

import com.eventmanagementsystem.backend.entity.IncomeCategory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IncomeCategoryRepository extends JpaRepository<IncomeCategory, Long> {
}
