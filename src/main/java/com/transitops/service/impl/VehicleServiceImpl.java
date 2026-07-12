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
    public VehicleResponse addVehicle(VehicleRequest request) {

        if (vehicleRepository.existsByVehicleNumber(request.getVehicleNumber())) {
            throw new BadRequestException("Vehicle already exists");
        }

        Vehicle vehicle = Vehicle.builder()
                .vehicleNumber(request.getVehicleNumber())
                .vehicleType(request.getVehicleType())
                .capacity(request.getCapacity())
                .status(request.getStatus())
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
    public VehicleResponse updateVehicle(Long id, VehicleRequest request) {

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        vehicle.setVehicleNumber(request.getVehicleNumber());
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setCapacity(request.getCapacity());
        vehicle.setStatus(request.getStatus());

        vehicleRepository.save(vehicle);

        return map(vehicle);
    }

    @Override
    public void deleteVehicle(Long id) {

        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));

        vehicleRepository.delete(vehicle);
    }

    private VehicleResponse map(Vehicle vehicle) {

        return VehicleResponse.builder()
                .id(vehicle.getId())
                .vehicleNumber(vehicle.getVehicleNumber())
                .vehicleType(vehicle.getVehicleType())
                .capacity(vehicle.getCapacity())
                .status(vehicle.getStatus())
                .build();
    }
}