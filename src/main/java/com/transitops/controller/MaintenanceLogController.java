package com.transitops.controller;

import com.transitops.dto.request.MaintenanceLogRequest;
import com.transitops.dto.response.MaintenanceLogResponse;
import com.transitops.service.MaintenanceLogService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/maintenance")
public class MaintenanceLogController {

    private final MaintenanceLogService maintenanceLogService;

    public MaintenanceLogController(MaintenanceLogService maintenanceLogService) {
        this.maintenanceLogService = maintenanceLogService;
    }

    @PostMapping
    public MaintenanceLogResponse addMaintenanceLog(@RequestBody MaintenanceLogRequest request) {
        return maintenanceLogService.addMaintenanceLog(request);
    }

    @GetMapping
    public List<MaintenanceLogResponse> getAllMaintenanceLogs() {
        return maintenanceLogService.getAllMaintenanceLogs();
    }

    @GetMapping("/{id}")
    public MaintenanceLogResponse getMaintenanceLogById(@PathVariable Long id) {
        return maintenanceLogService.getMaintenanceLogById(id);
    }

    @PutMapping("/{id}")
    public MaintenanceLogResponse updateMaintenanceLog(@PathVariable Long id, @RequestBody MaintenanceLogRequest request) {
        return maintenanceLogService.updateMaintenanceLog(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteMaintenanceLog(@PathVariable Long id) {
        maintenanceLogService.deleteMaintenanceLog(id);
        return "Maintenance log deleted successfully";
    }

    @PutMapping("/{id}/complete")
    public MaintenanceLogResponse completeMaintenanceLog(@PathVariable Long id, @RequestBody CompleteRequest request) {
        return maintenanceLogService.completeMaintenanceLog(id, request.getCost(), request.getCompletedDate());
    }

    @lombok.Data
    public static class CompleteRequest {
        private Double cost;
        private String completedDate;
    }
}
