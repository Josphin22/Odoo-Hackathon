package com.transitops.dto.request;

import lombok.Data;

@Data
public class DriverRequest {

    private String fullName;

    private String licenseNumber;

    private String phoneNumber;

    private String status;

}