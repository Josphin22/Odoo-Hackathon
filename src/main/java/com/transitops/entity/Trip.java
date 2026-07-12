package com.transitops.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "trips")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long vehicleId;

    private Long driverId;

    private String source;

    private String destination;

    private String tripDate;

    private String status;
}