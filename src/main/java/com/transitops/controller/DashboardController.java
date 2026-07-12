package com.transitops.controller;

import com.transitops.dto.response.DashboardResponse;
import com.transitops.service.DashboardService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/api/dashboard")
    public DashboardResponse dashboard() {
        return dashboardService.getDashboard();
    }
}