package com.transitops.dto.response;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanySettingResponse {
    private Long id;
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
    private Double defaultFuelPrice;
    private Integer defaultMaintenanceInterval;
}
