package com.transitops.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class FuelLogResponse {

    private Long id;

    private Long vehicleId;

    private String vehicleNumber;

    private Long driverId;

    private String driverName;

    private String date;

    private Double liters;

    private Double cost;

    private Integer odometer;
}
