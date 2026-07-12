package com.transitops.dto.request;

import lombok.Data;

@Data
public class MaintenanceLogRequest {

    private Long vehicleId;

    private String type;

    private String description;

    private Double cost;

    private String scheduledDate;

    private String completedDate;

    private String status;
}
