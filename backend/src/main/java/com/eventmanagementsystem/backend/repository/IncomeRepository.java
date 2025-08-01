package com.eventmanagementsystem.backend.repository;


import com.eventmanagementsystem.backend.entity.Income;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncomeRepository extends JpaRepository<Income, Long> {
    List<Income> findByEventId(Long eventId);
}

