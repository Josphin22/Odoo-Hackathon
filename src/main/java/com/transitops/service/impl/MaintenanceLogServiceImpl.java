package com.transitops.service.impl;

import com.transitops.dto.request.MaintenanceLogRequest;
import com.transitops.dto.response.MaintenanceLogResponse;
import com.transitops.entity.MaintenanceLog;
import com.transitops.entity.Vehicle;
import com.transitops.exception.BadRequestException;
import com.transitops.exception.ResourceNotFoundException;
import com.transitops.repository.MaintenanceLogRepository;
import com.transitops.repository.VehicleRepository;
import com.transitops.service.MaintenanceLogService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class MaintenanceLogServiceImpl implements MaintenanceLogService {

    private final MaintenanceLogRepository maintenanceLogRepository;
    private final VehicleRepository vehicleRepository;

    public MaintenanceLogServiceImpl(MaintenanceLogRepository maintenanceLogRepository,
                                     VehicleRepository vehicleRepository) {
        this.maintenanceLogRepository = maintenanceLogRepository;
        this.vehicleRepository = vehicleRepository;
    }

    @Override
    @Transactional
    public MaintenanceLogResponse addMaintenanceLog(MaintenanceLogRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        String status = request.getStatus();
        if (status == null || status.trim().isEmpty()) {
            status = "Scheduled";
        }

        // Business rule: Vehicle state transition to 'In Shop' if 'In Progress'
        if ("In Progress".equalsIgnoreCase(status)) {
            vehicle.setStatus("In Shop");
            vehicleRepository.save(vehicle);
        }

        MaintenanceLog log = MaintenanceLog.builder()
                .vehicle(vehicle)
                .type(request.getType())
                .description(request.getDescription())
                .cost(request.getCost() != null ? request.getCost() : 0.0)
                .scheduledDate(request.getScheduledDate() != null ? LocalDate.parse(request.getScheduledDate()) : LocalDate.now())
                .completedDate(request.getCompletedDate() != null ? LocalDate.parse(request.getCompletedDate()) : null)
                .status(status)
                .build();

        maintenanceLogRepository.save(log);
        return map(log);
    }

    @Override
    public List<MaintenanceLogResponse> getAllMaintenanceLogs() {
        return maintenanceLogRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public MaintenanceLogResponse getMaintenanceLogById(Long id) {
        MaintenanceLog log = maintenanceLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance log not found"));
        return map(log);
    }

    @Override
    @Transactional
    public MaintenanceLogResponse updateMaintenanceLog(Long id, MaintenanceLogRequest request) {
        MaintenanceLog log = maintenanceLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance log not found"));

        if (request.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
            log.setVehicle(vehicle);
        }

        if (request.getType() != null) {
            log.setType(request.getType());
        }
        if (request.getDescription() != null) {
            log.setDescription(request.getDescription());
        }
        if (request.getCost() != null) {
            log.setCost(request.getCost());
        }
        if (request.getScheduledDate() != null) {
            log.setScheduledDate(LocalDate.parse(request.getScheduledDate()));
        }
        if (request.getCompletedDate() != null) {
            log.setCompletedDate(LocalDate.parse(request.getCompletedDate()));
        }

        if (request.getStatus() != null) {
            String oldStatus = log.getStatus();
            String newStatus = request.getStatus();
            log.setStatus(newStatus);

            Vehicle vehicle = log.getVehicle();
            if ("In Progress".equalsIgnoreCase(newStatus) && !"In Progress".equalsIgnoreCase(oldStatus)) {
                vehicle.setStatus("In Shop");
                vehicleRepository.save(vehicle);
            } else if ("Completed".equalsIgnoreCase(newStatus) && !"Completed".equalsIgnoreCase(oldStatus)) {
                vehicle.setStatus("Available");
                vehicleRepository.save(vehicle);
            }
        }

        maintenanceLogRepository.save(log);
        return map(log);
    }

    @Override
    @Transactional
    public void deleteMaintenanceLog(Long id) {
        MaintenanceLog log = maintenanceLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance log not found"));
        
        // If it was In Progress, return vehicle to Available
        if ("In Progress".equalsIgnoreCase(log.getStatus())) {
            Vehicle vehicle = log.getVehicle();
            vehicle.setStatus("Available");
            vehicleRepository.save(vehicle);
        }

        maintenanceLogRepository.delete(log);
    }

    @Override
    @Transactional
    public MaintenanceLogResponse completeMaintenanceLog(Long id, Double cost, String completedDate) {
        MaintenanceLog log = maintenanceLogRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance log not found"));

        log.setStatus("Completed");
        log.setCost(cost != null ? cost : log.getCost());
        log.setCompletedDate(completedDate != null ? LocalDate.parse(completedDate) : LocalDate.now());
        maintenanceLogRepository.save(log);

        Vehicle vehicle = log.getVehicle();
        vehicle.setStatus("Available");
        vehicleRepository.save(vehicle);

        return map(log);
    }

    private MaintenanceLogResponse map(MaintenanceLog log) {
        return MaintenanceLogResponse.builder()
                .id(log.getId())
                .vehicleId(log.getVehicle().getId())
                .vehicleNumber(log.getVehicle().getVehicleNumber())
                .type(log.getType())
                .description(log.getDescription())
                .cost(log.getCost())
                .scheduledDate(log.getScheduledDate().toString())
                .completedDate(log.getCompletedDate() != null ? log.getCompletedDate().toString() : null)
                .status(log.getStatus())
                .build();
    }
}
