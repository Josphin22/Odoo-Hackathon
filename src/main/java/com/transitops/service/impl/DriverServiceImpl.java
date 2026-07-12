package com.transitops.service.impl;

import com.transitops.dto.request.DriverRequest;
import com.transitops.dto.response.DriverResponse;
import com.transitops.entity.Driver;
import com.transitops.exception.BadRequestException;
import com.transitops.exception.ResourceNotFoundException;
import com.transitops.repository.DriverRepository;
import com.transitops.service.DriverService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DriverServiceImpl implements DriverService {

    private final DriverRepository driverRepository;

    public DriverServiceImpl(DriverRepository driverRepository) {
        this.driverRepository = driverRepository;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public DriverResponse addDriver(DriverRequest request) {

        if (driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            throw new BadRequestException("Driver already exists");
        }

        String status = request.getStatus();
        if (status == null || status.trim().isEmpty()) {
            status = "Available";
        }

        Driver driver = Driver.builder()
                .fullName(request.getName())
                .licenseNumber(request.getLicenseNumber())
                .licenseCategory(request.getLicenseCategory())
                .licenseExpiryDate(request.getLicenseExpiryDate() != null ? java.time.LocalDate.parse(request.getLicenseExpiryDate()) : null)
                .phoneNumber(request.getContactNumber())
                .safetyScore(request.getSafetyScore())
                .status(status)
                .build();

        driverRepository.save(driver);

        return map(driver);
    }

    @Override
    public List<DriverResponse> getAllDrivers() {
        return driverRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public DriverResponse getDriverById(Long id) {

        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        return map(driver);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public DriverResponse updateDriver(Long id, DriverRequest request) {

        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        if (request.getName() != null) {
            driver.setFullName(request.getName());
        }
        if (request.getLicenseNumber() != null) {
            driver.setLicenseNumber(request.getLicenseNumber());
        }
        if (request.getLicenseCategory() != null) {
            driver.setLicenseCategory(request.getLicenseCategory());
        }
        if (request.getLicenseExpiryDate() != null) {
            driver.setLicenseExpiryDate(java.time.LocalDate.parse(request.getLicenseExpiryDate()));
        }
        if (request.getContactNumber() != null) {
            driver.setPhoneNumber(request.getContactNumber());
        }
        if (request.getSafetyScore() != null) {
            driver.setSafetyScore(request.getSafetyScore());
        }
        if (request.getStatus() != null) {
            driver.setStatus(request.getStatus());
        }

        driverRepository.save(driver);

        return map(driver);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteDriver(Long id) {

        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        if ("On Trip".equalsIgnoreCase(driver.getStatus())) {
            throw new BadRequestException("Cannot delete driver while they are currently driving a trip.");
        }

        driverRepository.delete(driver);
    }

    private DriverResponse map(Driver driver) {

        return DriverResponse.builder()
                .id(driver.getId())
                .name(driver.getFullName())
                .licenseNumber(driver.getLicenseNumber())
                .licenseCategory(driver.getLicenseCategory())
                .licenseExpiryDate(driver.getLicenseExpiryDate() != null ? driver.getLicenseExpiryDate().toString() : null)
                .contactNumber(driver.getPhoneNumber())
                .safetyScore(driver.getSafetyScore())
                .status(driver.getStatus())
                .build();
    }
}