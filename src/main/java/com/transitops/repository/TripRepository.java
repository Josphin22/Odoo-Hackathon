package com.transitops.repository;

import com.transitops.entity.Trip;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TripRepository extends JpaRepository<Trip, Long> {
    Long countByStatus(String status);
    boolean existsByDriverIdAndStatus(Long driverId, String status);
    boolean existsByVehicleIdAndStatus(Long vehicleId, String status);
    List<Trip> findByDriverId(Long driverId);
}