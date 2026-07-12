package com.transitops.controller;

import com.transitops.entity.AuditLog;
import com.transitops.entity.LoginHistory;
import com.transitops.repository.AuditLogRepository;
import com.transitops.repository.LoginHistoryRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminLogController {

    private final AuditLogRepository auditLogRepository;
    private final LoginHistoryRepository loginHistoryRepository;

    public AdminLogController(AuditLogRepository auditLogRepository,
                              LoginHistoryRepository loginHistoryRepository) {
        this.auditLogRepository = auditLogRepository;
        this.loginHistoryRepository = loginHistoryRepository;
    }

    @GetMapping("/audit-logs")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<AuditLog>> getAuditLogs() {
        return ResponseEntity.ok(auditLogRepository.findAllByOrderByTimestampDesc());
    }

    @GetMapping("/login-history")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<LoginHistory>> getLoginHistory() {
        return ResponseEntity.ok(loginHistoryRepository.findAllByOrderByLoginTimeDesc());
    }
}
