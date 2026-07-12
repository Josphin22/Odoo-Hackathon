package com.transitops.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class MaintenanceLogResponse {

    private Long id;

    private Long vehicleId;

    private String vehicleNumber; // useful helper for frontend displaying log details

    private String type;

    private String description;

    private Double cost;

    private String scheduledDate;

    private String completedDate;

    private String status;
}
