package com.transitops.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanySettingRequest {

    @NotBlank(message = "Company name is required")
    private String companyName;

    private String logo;

    private String gstNumber;

    private String panNumber;

    private String transportLicenseNo;

    private String address;

    private String phoneNumber;

    private String email;

    private String website;

    private String workingHours;

    private String timezone;

    private String currency;

    private String fiscalYear;

    @NotNull(message = "Default fuel price is required")
    private Double defaultFuelPrice;

    @NotNull(message = "Default maintenance interval is required")
    private Integer defaultMaintenanceInterval;
}
