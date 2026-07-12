package com.transitops.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "vehicles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String vehicleNumber;

    @Column(nullable = false)
    private String vehicleType;

    @Column(nullable = false)
    private Integer capacity;

    @Column(nullable = false)
    private String status;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private Integer odometer;

    @Column(nullable = false)
    private Double acquisitionCost;

    @Column(nullable = false)
    private String region;
}