package com.transitops.service.impl;

import com.transitops.dto.request.VehicleRequest;
import com.transitops.dto.response.VehicleResponse;
import com.transitops.entity.Vehicle;
import com.transitops.exception.BadRequestException;
import com.transitops.exception.ResourceNotFoundException;
import com.transitops.repository.VehicleRepository;
import com.transitops.service.VehicleService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;

    public VehicleServiceImpl(VehicleRepository vehicleRepository) {
        this.vehicleRepository = vehicleRepository;
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public VehicleResponse addVehicle(VehicleRequest request) {

        if (vehicleRepository.existsByVehicleNumber(request.getRegistrationNumber())) {
            throw new BadRequestException("Vehicle already exists");
        }

        String status = request.getStatus();
        if (status == null || status.trim().isEmpty()) {
            status = "Available";
        }

        Vehicle vehicle = Vehicle.builder()
                .vehicleNumber(request.getRegistrationNumber())
                .vehicleType(request.getType())
                .capacity(request.getMaxCapacity())
                .status(status)
                .name(request.getName())
                .odometer(request.getOdometer())
                .acquisitionCost(request.getAcquisitionCost())
                .region(request.getRegion())
                .build();

        vehicleRepository.save(vehicle);

        return map(vehicle);
    }

    @Override
    public List<VehicleResponse> getAllVehicles() {
        return vehicleRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public VehicleResponse getVehicleById(Long id) {

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        return map(vehicle);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        if (request.getRegistrationNumber() != null) {
            vehicle.setVehicleNumber(request.getRegistrationNumber());
        }
        if (request.getType() != null) {
            vehicle.setVehicleType(request.getType());
        }
        if (request.getMaxCapacity() != null) {
            vehicle.setCapacity(request.getMaxCapacity());
        }
        if (request.getStatus() != null) {
            vehicle.setStatus(request.getStatus());
        }
        if (request.getName() != null) {
            vehicle.setName(request.getName());
        }
        if (request.getOdometer() != null) {
            vehicle.setOdometer(request.getOdometer());
        }
        if (request.getAcquisitionCost() != null) {
            vehicle.setAcquisitionCost(request.getAcquisitionCost());
        }
        if (request.getRegion() != null) {
            vehicle.setRegion(request.getRegion());
        }

        vehicleRepository.save(vehicle);

        return map(vehicle);
    }

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void deleteVehicle(Long id) {

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        if ("On Trip".equalsIgnoreCase(vehicle.getStatus())) {
            throw new BadRequestException("Cannot delete vehicle while it is currently deployed on a trip.");
        }

        vehicleRepository.delete(vehicle);
    }

    private VehicleResponse map(Vehicle vehicle) {

        return VehicleResponse.builder()
                .id(vehicle.getId())
                .registrationNumber(vehicle.getVehicleNumber())
                .name(vehicle.getName())
                .type(vehicle.getVehicleType())
                .maxCapacity(vehicle.getCapacity())
                .odometer(vehicle.getOdometer())
                .acquisitionCost(vehicle.getAcquisitionCost())
                .region(vehicle.getRegion())
                .status(vehicle.getStatus())
                .build();
    }
}