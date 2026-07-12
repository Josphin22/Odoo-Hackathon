package com.transitops.service;

import com.transitops.dto.request.MaintenanceLogRequest;
import com.transitops.dto.response.MaintenanceLogResponse;
import java.util.List;

public interface MaintenanceLogService {

    MaintenanceLogResponse addMaintenanceLog(MaintenanceLogRequest request);

    List<MaintenanceLogResponse> getAllMaintenanceLogs();

    MaintenanceLogResponse getMaintenanceLogById(Long id);

    MaintenanceLogResponse updateMaintenanceLog(Long id, MaintenanceLogRequest request);

    void deleteMaintenanceLog(Long id);

    MaintenanceLogResponse completeMaintenanceLog(Long id, Double cost, String completedDate);
}
