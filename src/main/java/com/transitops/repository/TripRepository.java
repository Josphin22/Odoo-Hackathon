package com.transitops.repository;

import com.transitops.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TripRepository extends JpaRepository<Trip, Long> {
    Long countByStatus(String status);
}