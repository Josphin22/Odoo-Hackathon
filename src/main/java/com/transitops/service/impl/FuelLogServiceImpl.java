package com.transitops.service.impl;

import com.transitops.dto.request.FuelLogRequest;
import com.transitops.dto.response.FuelLogResponse;
import com.transitops.entity.Driver;
import com.transitops.entity.Expense;
import com.transitops.entity.FuelLog;
import com.transitops.entity.Vehicle;
import com.transitops.exception.ResourceNotFoundException;
import com.transitops.repository.DriverRepository;
import com.transitops.repository.ExpenseRepository;
import com.transitops.repository.FuelLogRepository;
import com.transitops.repository.VehicleRepository;
import com.transitops.service.FuelLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class FuelLogServiceImpl implements FuelLogService {

    private final FuelLogRepository fuelLogRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final ExpenseRepository expenseRepository;

    public FuelLogServiceImpl(FuelLogRepository fuelLogRepository,
                               VehicleRepository vehicleRepository,
                               DriverRepository driverRepository,
                               ExpenseRepository expenseRepository) {
        this.fuelLogRepository = fuelLogRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.expenseRepository = expenseRepository;
    }

    @Override
    @Transactional
    public FuelLogResponse addFuelLog(FuelLogRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        FuelLog log = FuelLog.builder()
                .vehicle(vehicle)
                .driver(driver)
                .date(request.getDate() != null ? LocalDate.parse(request.getDate()) : LocalDate.now())
                .liters(request.getLiters())
                .cost(request.getCost())
                .odometer(request.getOdometer())
                .build();

        fuelLogRepository.save(log);

        // Rule: Automatically register Expense of category 'Fuel'
        Expense expense = Expense.builder()
                .vehicle(vehicle)
                .category("Fuel")
                .amount(request.getCost())
                .date(log.getDate())
                .description("Automated fuel cost registration for Fuel Log #" + log.getId())
                .referenceId("FUEL-" + log.getId())
                .build();
        expenseRepository.save(expense);

        return map(log);
    }

    @Override
    public List<FuelLogResponse> getAllFuelLogs() {
        return fuelLogRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public FuelLogResponse getFuelLogById(Long id) {
        FuelLog log = fuelLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fuel log not found"));
        return map(log);
    }

    @Override
    @Transactional
    public FuelLogResponse updateFuelLog(Long id, FuelLogRequest request) {
        FuelLog log = fuelLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fuel log not found"));

        if (request.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
            log.setVehicle(vehicle);
        }
        if (request.getDriverId() != null) {
            Driver driver = driverRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
            log.setDriver(driver);
        }

        if (request.getDate() != null) {
            log.setDate(LocalDate.parse(request.getDate()));
        }
        if (request.getLiters() != null) {
            log.setLiters(request.getLiters());
        }
        if (request.getCost() != null) {
            log.setCost(request.getCost());
        }
        if (request.getOdometer() != null) {
            log.setOdometer(request.getOdometer());
        }

        fuelLogRepository.save(log);

        // Keep associated expense updated
        expenseRepository.findByReferenceId("FUEL-" + log.getId()).ifPresent(expense -> {
            expense.setVehicle(log.getVehicle());
            expense.setAmount(log.getCost());
            expense.setDate(log.getDate());
            expenseRepository.save(expense);
        });

        return map(log);
    }

    @Override
    @Transactional
    public void deleteFuelLog(Long id) {
        FuelLog log = fuelLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Fuel log not found"));

        // Delete associated expense
        expenseRepository.deleteByReferenceId("FUEL-" + log.getId());

        fuelLogRepository.delete(log);
    }

    private FuelLogResponse map(FuelLog log) {
        return FuelLogResponse.builder()
                .id(log.getId())
                .vehicleId(log.getVehicle().getId())
                .vehicleNumber(log.getVehicle().getVehicleNumber())
                .driverId(log.getDriver().getId())
                .driverName(log.getDriver().getFullName())
                .date(log.getDate().toString())
                .liters(log.getLiters())
                .cost(log.getCost())
                .odometer(log.getOdometer())
                .build();
    }
}
