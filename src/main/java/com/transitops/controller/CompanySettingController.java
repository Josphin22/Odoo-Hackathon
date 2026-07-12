package com.transitops.controller;

import com.transitops.dto.request.CompanySettingRequest;
import com.transitops.dto.response.CompanySettingResponse;
import com.transitops.service.CompanySettingService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/settings")
public class CompanySettingController {

    private final CompanySettingService companySettingService;

    public CompanySettingController(CompanySettingService companySettingService) {
        this.companySettingService = companySettingService;
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CompanySettingResponse> getCompanySettings() {
        return ResponseEntity.ok(companySettingService.getCompanySetting());
    }

    @PutMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CompanySettingResponse> updateCompanySettings(@Valid @RequestBody CompanySettingRequest request) {
        return ResponseEntity.ok(companySettingService.updateCompanySetting(request));
    }
}
