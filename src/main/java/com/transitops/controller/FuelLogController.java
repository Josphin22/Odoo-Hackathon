package com.transitops.controller;

import com.transitops.dto.request.FuelLogRequest;
import com.transitops.dto.response.FuelLogResponse;
import com.transitops.service.FuelLogService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fuel")
public class FuelLogController {

    private final FuelLogService fuelLogService;

    public FuelLogController(FuelLogService fuelLogService) {
        this.fuelLogService = fuelLogService;
    }

    @PostMapping
    public FuelLogResponse addFuelLog(@RequestBody FuelLogRequest request) {
        return fuelLogService.addFuelLog(request);
    }

    @GetMapping
    public List<FuelLogResponse> getAllFuelLogs() {
        return fuelLogService.getAllFuelLogs();
    }

    @GetMapping("/{id}")
    public FuelLogResponse getFuelLogById(@PathVariable Long id) {
        return fuelLogService.getFuelLogById(id);
    }

    @PutMapping("/{id}")
    public FuelLogResponse updateFuelLog(@PathVariable Long id, @RequestBody FuelLogRequest request) {
        return fuelLogService.updateFuelLog(id, request);
    }

    @DeleteMapping("/{id}")
    public String deleteFuelLog(@PathVariable Long id) {
        fuelLogService.deleteFuelLog(id);
        return "Fuel log deleted successfully";
    }
}
