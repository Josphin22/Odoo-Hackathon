package com.transitops.dto.request;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmployeeRequest {

    @NotBlank(message = "Name is required")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email must be valid")
    private String email;

    private String password; // Temporary password

    private String phoneNumber;

    private String department;

    @NotBlank(message = "Role name is required")
    private String role; // e.g. "ADMIN", "DRIVER", "FLEET_MANAGER"

    @NotBlank(message = "Status is required")
    private String status; // ACTIVE, INACTIVE, SUSPENDED, ON_LEAVE, TERMINATED

    private String dob; // LocalDate string

    private String emergencyContact;

    private String bloodGroup;

    private String nationality;

    private String aadhaarNumber;

    private String remarks;

    // Driver-specific profile fields (only utilized when role is DRIVER)
    private String licenseNumber;
    private String licenseCategory;
    private String licenseExpiryDate;
    private Integer safetyScore;
}
