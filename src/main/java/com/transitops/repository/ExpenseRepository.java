package com.transitops.repository;

import com.transitops.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    java.util.Optional<Expense> findByReferenceId(String referenceId);

    void deleteByReferenceId(String referenceId);
}
