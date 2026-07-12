package com.transitops.service.impl;

import com.transitops.dto.response.AnalyticsResponse;
import com.transitops.dto.response.ExpenseResponse;
import com.transitops.entity.Expense;
import com.transitops.entity.FuelLog;
import com.transitops.entity.MaintenanceLog;
import com.transitops.entity.Trip;
import com.transitops.entity.Vehicle;
import com.transitops.repository.*;
import com.transitops.service.ReportService;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ReportServiceImpl implements ReportService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;
    private final FuelLogRepository fuelLogRepository;
    private final MaintenanceLogRepository maintenanceLogRepository;
    private final ExpenseRepository expenseRepository;

    public ReportServiceImpl(VehicleRepository vehicleRepository,
                             DriverRepository driverRepository,
                             TripRepository tripRepository,
                             FuelLogRepository fuelLogRepository,
                             MaintenanceLogRepository maintenanceLogRepository,
                             ExpenseRepository expenseRepository) {
        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.tripRepository = tripRepository;
        this.fuelLogRepository = fuelLogRepository;
        this.maintenanceLogRepository = maintenanceLogRepository;
        this.expenseRepository = expenseRepository;
    }

    @Override
    public AnalyticsResponse getAnalytics() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        List<Trip> trips = tripRepository.findAll();
        List<FuelLog> fuelLogs = fuelLogRepository.findAll();
        List<MaintenanceLog> maintenanceLogs = maintenanceLogRepository.findAll();
        List<Expense> expenses = expenseRepository.findAll();

        long totalVehicles = vehicles.size();
        long activeVehicles = vehicles.stream().filter(v -> "On Trip".equalsIgnoreCase(v.getStatus())).count();
        long inShopVehicles = vehicles.stream().filter(v -> "In Shop".equalsIgnoreCase(v.getStatus())).count();
        long availableVehicles = vehicles.stream().filter(v -> "Available".equalsIgnoreCase(v.getStatus())).count();
        int utilization = totalVehicles > 0 ? (int) Math.round(((double) activeVehicles / totalVehicles) * 100.0) : 0;

        long totalTrips = trips.size();
        long pendingTrips = trips.stream().filter(t -> "Draft".equalsIgnoreCase(t.getStatus())).count();
        long activeTrips = trips.stream().filter(t -> "Dispatched".equalsIgnoreCase(t.getStatus())).count();
        long driversOnDuty = driverRepository.countByStatus("Available") + driverRepository.countByStatus("On Trip");

        AnalyticsResponse.KpiDto kpi = AnalyticsResponse.KpiDto.builder()
                .totalVehicles(totalVehicles)
                .activeVehicles(activeVehicles)
                .inShopVehicles(inShopVehicles)
                .availableVehicles(availableVehicles)
                .utilization(utilization)
                .totalTrips(totalTrips)
                .pendingTrips(pendingTrips)
                .activeTrips(activeTrips)
                .driversOnDuty(driversOnDuty)
                .build();

        List<AnalyticsResponse.RoiDto> roiList = vehicles.stream().map(v -> {
            List<Trip> vehicleTrips = trips.stream().filter(t -> t.getVehicle().getId().equals(v.getId()) && "Completed".equalsIgnoreCase(t.getStatus())).toList();
            double distanceCompleted = vehicleTrips.stream().mapToDouble(t -> t.getActualDistance() != null ? t.getActualDistance() : 0.0).sum();
            double revenue = distanceCompleted * 2.5;

            double vehicleFuel = fuelLogs.stream().filter(f -> f.getVehicle().getId().equals(v.getId())).mapToDouble(FuelLog::getCost).sum();
            double vehicleMaint = maintenanceLogs.stream().filter(m -> m.getVehicle().getId().equals(v.getId())).mapToDouble(MaintenanceLog::getCost).sum();
            double operationalCost = vehicleFuel + vehicleMaint;

            double roiValue = v.getAcquisitionCost() > 0
                    ? Math.round(((revenue - operationalCost) / v.getAcquisitionCost()) * 100.0 * 100.0) / 100.0
                    : 0.0;

            return AnalyticsResponse.RoiDto.builder()
                    .id(v.getId())
                    .name(v.getName())
                    .registrationNumber(v.getVehicleNumber())
                    .revenue(revenue)
                    .operationalCost(operationalCost)
                    .fuelCost(vehicleFuel)
                    .maintenanceCost(vehicleMaint)
                    .acquisitionCost(v.getAcquisitionCost())
                    .roi(roiValue)
                    .build();
        }).toList();

        List<AnalyticsResponse.FuelEfficiencyDto> efficiencyList = vehicles.stream().map(v -> {
            List<Trip> vehicleTrips = trips.stream().filter(t -> t.getVehicle().getId().equals(v.getId()) && "Completed".equalsIgnoreCase(t.getStatus())).toList();
            double distance = vehicleTrips.stream().mapToDouble(t -> t.getActualDistance() != null ? t.getActualDistance() : 0.0).sum();
            double fuel = fuelLogs.stream().filter(f -> f.getVehicle().getId().equals(v.getId())).mapToDouble(FuelLog::getLiters).sum();
            double efficiency = fuel > 0 ? Math.round((distance / fuel) * 100.0) / 100.0 : 0.0;

            return AnalyticsResponse.FuelEfficiencyDto.builder()
                    .id(v.getId())
                    .name(v.getName())
                    .registrationNumber(v.getVehicleNumber())
                    .distance(distance)
                    .fuelUsed(fuel)
                    .efficiency(efficiency)
                    .build();
        }).toList();

        List<ExpenseResponse> expenseResponses = expenses.stream().map(e -> ExpenseResponse.builder()
                .id(e.getId())
                .vehicleId(e.getVehicle() != null ? e.getVehicle().getId() : null)
                .vehicleNumber(e.getVehicle() != null ? e.getVehicle().getVehicleNumber() : null)
                .category(e.getCategory())
                .amount(e.getAmount())
                .date(e.getDate().toString())
                .description(e.getDescription())
                .referenceId(e.getReferenceId())
                .build()).toList();

        return AnalyticsResponse.builder()
                .kpi(kpi)
                .roi(roiList)
                .fuelEfficiency(efficiencyList)
                .expenses(expenseResponses)
                .build();
    }
}
