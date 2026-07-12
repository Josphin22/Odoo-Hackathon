package com.transitops.service.impl;

import com.transitops.dto.request.TripRequest;
import com.transitops.dto.response.TripResponse;
import com.transitops.entity.Trip;
import com.transitops.exception.ResourceNotFoundException;
import com.transitops.repository.TripRepository;
import com.transitops.service.TripService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TripServiceImpl implements TripService {

    private final TripRepository tripRepository;

    public TripServiceImpl(TripRepository tripRepository) {
        this.tripRepository = tripRepository;
    }

    @Override
    public TripResponse addTrip(TripRequest request) {

        Trip trip = Trip.builder()
                .vehicleId(request.getVehicleId())
                .driverId(request.getDriverId())
                .source(request.getSource())
                .destination(request.getDestination())
                .tripDate(request.getTripDate())
                .status(request.getStatus())
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
    public TripResponse updateTrip(Long id, TripRequest request) {

        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        trip.setVehicleId(request.getVehicleId());
        trip.setDriverId(request.getDriverId());
        trip.setSource(request.getSource());
        trip.setDestination(request.getDestination());
        trip.setTripDate(request.getTripDate());
        trip.setStatus(request.getStatus());

        tripRepository.save(trip);

        return map(trip);
    }

    @Override
    public void deleteTrip(Long id) {

        Trip trip = tripRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Trip not found"));

        tripRepository.delete(trip);
    }

    private TripResponse map(Trip trip) {

        return TripResponse.builder()
                .id(trip.getId())
                .vehicleId(trip.getVehicleId())
                .driverId(trip.getDriverId())
                .source(trip.getSource())
                .destination(trip.getDestination())
                .tripDate(trip.getTripDate())
                .status(trip.getStatus())
                .build();
    }
}