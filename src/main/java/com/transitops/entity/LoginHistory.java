package com.transitops.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "login_histories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String username; // user email

    @Column(nullable = false)
    private LocalDateTime loginTime;

    private LocalDateTime logoutTime;

    private String ipAddress;

    private String browser;

    private String device;

    private String operatingSystem;

    private String country;

    private String city;

    @Column(nullable = false)
    private String status; // SUCCESS, FAILED

    private String logoutReason; // LOGOUT, TIMEOUT, DISCONNECT
}
