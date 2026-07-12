package com.transitops.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DriverResponse {

    private Long id;

    private String name;

    private String licenseNumber;

    private String licenseCategory;

    private String licenseExpiryDate;

    private String contactNumber;

    private Integer safetyScore;

    private String status;

}