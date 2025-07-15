package com.eventmanagementsystem.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "incomecategory")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class IncomeCategory {
    @Id
    @GeneratedValue
    private Long id;
    private String name;
}
