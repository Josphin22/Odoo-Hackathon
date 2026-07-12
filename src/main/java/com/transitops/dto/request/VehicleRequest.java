package com.transitops.dto.request;

import lombok.Data;

@Data
public class VehicleRequest {

    private String vehicleNumber;

    private String vehicleType;

    private Integer capacity;

    private String status;

}