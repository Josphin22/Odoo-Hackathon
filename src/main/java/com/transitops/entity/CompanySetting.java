package com.transitops.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "company_settings")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CompanySetting {

    @Id
    private Long id; // Locked to 1 for singleton enforcement

    @Column(nullable = false)
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
