package com.transitops.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TripResponse {

    private Long id;

    private String tripNumber;

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

    private String createdAt;

    private String dispatchedAt;

    private String completedAt;
}