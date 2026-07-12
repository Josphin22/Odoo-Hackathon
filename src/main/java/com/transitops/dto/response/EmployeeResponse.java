package com.transitops.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeResponse {
    private Long id;
    private String employeeId;
    private String fullName;
    private String email;
    private String phoneNumber;
    private String department;
    private String role;
    private String status;
    private String dob;
    private String emergencyContact;
    private String bloodGroup;
    private String nationality;
    private String aadhaarNumber;
    private String remarks;
    private Boolean isLocked;
    private Boolean forcePasswordChange;

    // Driver-specific profile fields (only returned if role is DRIVER)
    private Long driverProfileId;
    private String licenseNumber;
    private String licenseCategory;
    private String licenseExpiryDate;
    private Integer safetyScore;
}
