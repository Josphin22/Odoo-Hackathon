package com.transitops.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class VehicleResponse {

    private Long id;

    private String vehicleNumber;

    private String vehicleType;

    private Integer capacity;

    private String status;

}