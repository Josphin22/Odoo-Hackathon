package com.transitops.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TripResponse {

    private Long id;

    private Long vehicleId;

    private Long driverId;

    private String source;

    private String destination;

    private String tripDate;

    private String status;
}