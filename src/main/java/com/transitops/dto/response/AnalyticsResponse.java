package com.transitops.dto.response;

import lombok.Builder;
import lombok.Data;
import java.util.List;

@Data
@Builder
public class AnalyticsResponse {

    private KpiDto kpi;
    private List<RoiDto> roi;
    private List<FuelEfficiencyDto> fuelEfficiency;
    private List<ExpenseResponse> expenses;

    @Data
    @Builder
    public static class KpiDto {
        private Long totalVehicles;
        private Long activeVehicles;
        private Long inShopVehicles;
        private Long availableVehicles;
        private Integer utilization;
        private Long totalTrips;
        private Long pendingTrips;
        private Long activeTrips;
        private Long driversOnDuty;
    }

    @Data
    @Builder
    public static class RoiDto {
        private Long id;
        private String name;
        private String registrationNumber;
        private Double revenue;
        private Double operationalCost;
        private Double fuelCost;
        private Double maintenanceCost;
        private Double acquisitionCost;
        private Double roi;
    }

    @Data
    @Builder
    public static class FuelEfficiencyDto {
        private Long id;
        private String name;
        private String registrationNumber;
        private Double distance;
        private Double fuelUsed;
        private Double efficiency;
    }
}
