package com.transitops.dto.request;

import lombok.Data;

@Data
public class TripRequest {

    private Long vehicleId;

    private Long driverId;

    private String source;

    private String destination;

    private String tripDate;

    private String status;

    private Double cargoWeight;

    private Double plannedDistance;

    private Double actualDistance;

    private Double fuelConsumed;
}