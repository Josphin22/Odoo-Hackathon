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
    public DriverResponse addDriver(DriverRequest request) {

        if(driverRepository.existsByLicenseNumber(request.getLicenseNumber())){
            throw new BadRequestException("Driver already exists");
        }

        Driver driver = Driver.builder()
                .fullName(request.getFullName())
                .licenseNumber(request.getLicenseNumber())
                .phoneNumber(request.getPhoneNumber())
                .status(request.getStatus())
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
    public DriverResponse updateDriver(Long id, DriverRequest request) {

        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        driver.setFullName(request.getFullName());
        driver.setLicenseNumber(request.getLicenseNumber());
        driver.setPhoneNumber(request.getPhoneNumber());
        driver.setStatus(request.getStatus());

        driverRepository.save(driver);

        return map(driver);
    }

    @Override
    public void deleteDriver(Long id) {

        Driver driver = driverRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        driverRepository.delete(driver);
    }

    private DriverResponse map(Driver driver){

        return DriverResponse.builder()
                .id(driver.getId())
                .fullName(driver.getFullName())
                .licenseNumber(driver.getLicenseNumber())
                .phoneNumber(driver.getPhoneNumber())
                .status(driver.getStatus())
                .build();
    }
}