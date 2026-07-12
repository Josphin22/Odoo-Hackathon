package com.transitops.repository;

import com.transitops.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;

public interface DriverRepository extends JpaRepository<Driver, Long> {

    boolean existsByLicenseNumber(String licenseNumber);

}