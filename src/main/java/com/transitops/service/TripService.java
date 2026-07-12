package com.transitops.service;

import com.transitops.dto.request.TripRequest;
import com.transitops.dto.response.TripResponse;

import java.util.List;

public interface TripService {

    TripResponse addTrip(TripRequest request);

    List<TripResponse> getAllTrips();

    TripResponse getTripById(Long id);

    TripResponse updateTrip(Long id, TripRequest request);

    void deleteTrip(Long id);
}