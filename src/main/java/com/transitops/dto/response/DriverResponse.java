package com.transitops.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DriverResponse {

    private Long id;

    private String fullName;

    private String licenseNumber;

    private String phoneNumber;

    private String status;

}