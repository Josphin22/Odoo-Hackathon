package com.transitops.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "permissions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(nullable = false)
    private String module; // VEHICLES, DRIVERS, TRIPS, MAINTENANCE, FUEL, EXPENSES, REPORTS, USERS, ROLES, AUDIT_LOGS

    @Column(nullable = false)
    private String action; // READ, CREATE, UPDATE, DELETE, DISPATCH, COMPLETE, EXPORT, APPROVE
}
