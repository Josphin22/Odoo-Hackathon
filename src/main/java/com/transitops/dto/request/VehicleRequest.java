package com.transitops.dto.request;

import lombok.Data;

@Data
public class VehicleRequest {

    private String registrationNumber;

    private String name;

    private String type;

    private Integer maxCapacity;

    private Integer odometer;

    private Double acquisitionCost;

    private String region;

    private String status;

}