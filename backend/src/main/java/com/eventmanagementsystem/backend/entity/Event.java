package com.eventmanagementsystem.backend.entity;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "events")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Event {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private LocalDate date;
    private String location;
    private String description;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    @JsonManagedReference(value = "event-income")
    private List<Income> incomes;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL)
    @JsonManagedReference(value = "event-expense")
    private List<Expense> expenses;
}
