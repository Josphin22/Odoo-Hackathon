package com.transitops.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DashboardResponse {

    private Long totalVehicles;
    private Long totalDrivers;
    private Long totalTrips;

    private Long availableVehicles;
    private Long availableDrivers;
}