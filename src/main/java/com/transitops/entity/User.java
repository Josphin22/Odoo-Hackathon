package com.transitops.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;

@Entity
@Table(name = "users")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String employeeId; // TOPS-EMP-XXXX

    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    private String phoneNumber;

    private String department;

    @Column(nullable = false)
    private String status; // ACTIVE, INACTIVE, SUSPENDED, ON_LEAVE, TERMINATED

    private LocalDate dob;

    private String emergencyContact;

    private String bloodGroup;

    private String nationality;

    private String aadhaarNumber;

    private String remarks;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isDeleted = false; // Soft Delete flag

    @Builder.Default
    @Column(nullable = false)
    private Integer failedLoginAttempts = 0;

    @Builder.Default
    @Column(nullable = false)
    private Boolean isLocked = false; // Locked after 5 failed login attempts

    @Builder.Default
    @Column(nullable = false)
    private Boolean forcePasswordChange = false; // Force change on first login

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "role_id", nullable = false)
    private Role role;
}