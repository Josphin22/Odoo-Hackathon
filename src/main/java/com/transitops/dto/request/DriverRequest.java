package com.transitops.dto.request;

import lombok.Data;

@Data
public class DriverRequest {

    private String name;

    private String licenseNumber;

    private String licenseCategory;

    private String licenseExpiryDate;

    private String contactNumber;

    private Integer safetyScore;

    private String status;

}