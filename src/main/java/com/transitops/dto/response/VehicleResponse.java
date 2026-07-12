package com.transitops.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VehicleResponse {

    private Long id;

    private String registrationNumber;

    private String name;

    private String type;

    private Integer maxCapacity;

    private Integer odometer;

    private Double acquisitionCost;

    private String region;

    private String status;

}