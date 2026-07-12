package com.transitops.dto.request;

import lombok.Data;

@Data
public class FuelLogRequest {

    private Long vehicleId;

    private Long driverId;

    private String date;

    private Double liters;

    private Double cost;

    private Integer odometer;
}
