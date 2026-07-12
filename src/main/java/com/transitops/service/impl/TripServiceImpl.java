package com.transitops.service.impl;

import com.transitops.dto.request.TripRequest;
import com.transitops.dto.response.TripResponse;
import com.transitops.entity.Driver;
import com.transitops.entity.Trip;
import com.transitops.entity.Vehicle;
import com.transitops.exception.BadRequestException;
import com.transitops.exception.ResourceNotFoundException;
import com.transitops.repository.DriverRepository;
import com.transitops.repository.TripRepository;
import com.transitops.repository.VehicleRepository;
import com.transitops.service.TripService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TripServiceImpl implements TripService {

    private final TripRepository tripRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;

    public TripServiceImpl(TripRepository tripRepository,
                           VehicleRepository vehicleRepository,
                           DriverRepository driverRepository) {
        this.tripRepository = tripRepository;
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
    }

    @Override
    @Transactional
    public TripResponse addTrip(TripRequest request) {
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
        Driver driver = driverRepository.findById(request.getDriverId())
                .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));

        // Business validations
        if ("Retired".equalsIgnoreCase(vehicle.getStatus()) || "In Shop".equalsIgnoreCase(vehicle.getStatus())) {
            throw new BadRequestException("Vehicle is currently '" + vehicle.getStatus() + "' and cannot be dispatched.");
        }
        if ("Suspended".equalsIgnoreCase(driver.getStatus())) {
            throw new BadRequestException("This driver is Suspended and cannot be assigned.");
        }
        if (driver.getLicenseExpiryDate() != null && driver.getLicenseExpiryDate().isBefore(java.time.LocalDate.of(2026, 7, 12))) {
            throw new BadRequestException("Driver's license expired on " + driver.getLicenseExpiryDate() + " and cannot be assigned to trips.");
        }
        if ("On Trip".equalsIgnoreCase(vehicle.getStatus())) {
            throw new BadRequestException("This vehicle is already dispatched on an active trip.");
        }
        if ("On Trip".equalsIgnoreCase(driver.getStatus())) {
            throw new BadRequestException("This driver is already assigned to an active trip.");
        }
        if (request.getCargoWeight() > vehicle.getCapacity()) {
            throw new BadRequestException("Cargo load (" + request.getCargoWeight() + " kg) exceeds vehicle's maximum load capacity (" + vehicle.getCapacity() + " kg).");
        }

        String tripNumber = "TRIP-" + (tripRepository.count() + 1001);

        Trip trip = Trip.builder()
                .tripNumber(tripNumber)
                .vehicle(vehicle)
                .driver(driver)
                .source(request.getSource())
                .destination(request.getDestination())
                .tripDate(request.getTripDate() != null ? request.getTripDate() : java.time.LocalDate.of(2026, 7, 12).toString())
                .cargoWeight(request.getCargoWeight())
                .plannedDistance(request.getPlannedDistance())
                .status("Draft")
                .createdAt(LocalDateTime.now())
                .build();

        tripRepository.save(trip);
        return map(trip);
    }

    @Override
    public List<TripResponse> getAllTrips() {
        return tripRepository.findAll()
                .stream()
                .map(this::map)
                .toList();
    }

    @Override
    public TripResponse getTripById(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        return map(trip);
    }

    @Override
    @Transactional
    public TripResponse updateTrip(Long id, TripRequest request) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        if (request.getVehicleId() != null) {
            Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                    .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found"));
            trip.setVehicle(vehicle);
        }
        if (request.getDriverId() != null) {
            Driver driver = driverRepository.findById(request.getDriverId())
                    .orElseThrow(() -> new ResourceNotFoundException("Driver not found"));
            trip.setDriver(driver);
        }
        if (request.getSource() != null) {
            trip.setSource(request.getSource());
        }
        if (request.getDestination() != null) {
            trip.setDestination(request.getDestination());
        }
        if (request.getTripDate() != null) {
            trip.setTripDate(request.getTripDate());
        }
        if (request.getCargoWeight() != null) {
            trip.setCargoWeight(request.getCargoWeight());
        }
        if (request.getPlannedDistance() != null) {
            trip.setPlannedDistance(request.getPlannedDistance());
        }
        if (request.getStatus() != null) {
            trip.setStatus(request.getStatus());
        }

        tripRepository.save(trip);
        return map(trip);
    }

    @Override
    @Transactional
    public void deleteTrip(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        tripRepository.delete(trip);
    }

    @Override
    @Transactional
    public TripResponse dispatchTrip(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        if (!"Draft".equalsIgnoreCase(trip.getStatus())) {
            throw new BadRequestException("Only Draft trips can be dispatched.");
        }

        Vehicle vehicle = trip.getVehicle();
        Driver driver = trip.getDriver();

        if ("On Trip".equalsIgnoreCase(vehicle.getStatus())) {
            throw new BadRequestException("Vehicle is already active on another trip.");
        }
        if ("On Trip".equalsIgnoreCase(driver.getStatus())) {
            throw new BadRequestException("Driver is already active on another trip.");
        }

        vehicle.setStatus("On Trip");
        driver.setStatus("On Trip");
        vehicleRepository.save(vehicle);
        driverRepository.save(driver);

        trip.setStatus("Dispatched");
        trip.setDispatchedAt(LocalDateTime.now());
        tripRepository.save(trip);

        return map(trip);
    }

    @Override
    @Transactional
    public TripResponse completeTrip(Long id, Double finalOdometer, Double fuelConsumed) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        if (!"Dispatched".equalsIgnoreCase(trip.getStatus())) {
            throw new BadRequestException("Only Dispatched trips can be marked completed.");
        }

        Vehicle vehicle = trip.getVehicle();
        Driver driver = trip.getDriver();

        if (finalOdometer <= vehicle.getOdometer()) {
            throw new BadRequestException("Final odometer readings (" + finalOdometer + " km) must be greater than vehicle's current odometer (" + vehicle.getOdometer() + " km).");
        }

        double tripDistance = finalOdometer - vehicle.getOdometer();

        trip.setStatus("Completed");
        trip.setActualDistance(tripDistance);
        trip.setFuelConsumed(fuelConsumed);
        trip.setCompletedAt(LocalDateTime.now());
        tripRepository.save(trip);

        vehicle.setStatus("Available");
        vehicle.setOdometer((int) Math.round(finalOdometer));
        vehicleRepository.save(vehicle);

        driver.setStatus("Available");
        driver.setSafetyScore(Math.max(10, Math.min(100, driver.getSafetyScore() + 1)));
        driverRepository.save(driver);

        return map(trip);
    }

    @Override
    @Transactional
    public TripResponse cancelTrip(Long id) {
        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));
        if ("Completed".equalsIgnoreCase(trip.getStatus())) {
            throw new BadRequestException("Cannot cancel a completed trip.");
        }

        String previousStatus = trip.getStatus();
        trip.setStatus("Cancelled");
        tripRepository.save(trip);

        if ("Dispatched".equalsIgnoreCase(previousStatus)) {
            Vehicle vehicle = trip.getVehicle();
            Driver driver = trip.getDriver();
            vehicle.setStatus("Available");
            driver.setStatus("Available");
            vehicleRepository.save(vehicle);
            driverRepository.save(driver);
        }

        return map(trip);
    }

    private TripResponse map(Trip trip) {
        return TripResponse.builder()
                .id(trip.getId())
                .tripNumber(trip.getTripNumber())
                .vehicleId(trip.getVehicle().getId())
                .driverId(trip.getDriver().getId())
                .source(trip.getSource())
                .destination(trip.getDestination())
                .tripDate(trip.getTripDate())
                .status(trip.getStatus())
                .cargoWeight(trip.getCargoWeight())
                .plannedDistance(trip.getPlannedDistance())
                .actualDistance(trip.getActualDistance())
                .fuelConsumed(trip.getFuelConsumed())
                .createdAt(trip.getCreatedAt() != null ? trip.getCreatedAt().toString() : null)
                .dispatchedAt(trip.getDispatchedAt() != null ? trip.getDispatchedAt().toString() : null)
                .completedAt(trip.getCompletedAt() != null ? trip.getCompletedAt().toString() : null)
                .build();
    }
}