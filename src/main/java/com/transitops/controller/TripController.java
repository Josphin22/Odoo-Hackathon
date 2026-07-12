package com.transitops.controller;

import com.transitops.dto.request.TripRequest;
import com.transitops.dto.response.TripResponse;
import com.transitops.service.TripService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/trips")
public class TripController {

    private final TripService tripService;

    public TripController(TripService tripService) {
        this.tripService = tripService;
    }

    @PostMapping
    public TripResponse addTrip(@RequestBody TripRequest request) {
        return tripService.addTrip(request);
    }

    @GetMapping
    public List<TripResponse> getAllTrips() {
        return tripService.getAllTrips();
    }

    @GetMapping("/{id}")
    public TripResponse getTripById(@PathVariable Long id) {
        return tripService.getTripById(id);
    }

    @PutMapping("/{id}")
    public TripResponse updateTrip(@PathVariable Long id,
                                   @RequestBody TripRequest request) {
        return tripService.updateTrip(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteTrip(@PathVariable Long id) {
        tripService.deleteTrip(id);
        return "Trip deleted successfully";
    }

    @PutMapping("/{id}/dispatch")
    public TripResponse dispatchTrip(@PathVariable Long id) {
        return tripService.dispatchTrip(id);
    }

    @PutMapping("/{id}/complete")
    public TripResponse completeTrip(@PathVariable Long id, @RequestBody CompleteRequest request) {
        return tripService.completeTrip(id, request.getFinalOdometer(), request.getFuelConsumed());
    }

    @PutMapping("/{id}/cancel")
    public TripResponse cancelTrip(@PathVariable Long id) {
        return tripService.cancelTrip(id);
    }

    @lombok.Data
    public static class CompleteRequest {
        private Double finalOdometer;
        private Double fuelConsumed;
    }
}