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
}