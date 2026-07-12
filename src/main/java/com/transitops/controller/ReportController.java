package com.transitops.controller;

import com.transitops.dto.response.AnalyticsResponse;
import com.transitops.service.ReportService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/analytics")
    public AnalyticsResponse getAnalytics() {
        return reportService.getAnalytics();
    }
}
