package com.transitops.service;

import com.transitops.dto.request.FuelLogRequest;
import com.transitops.dto.response.FuelLogResponse;
import java.util.List;

public interface FuelLogService {

    FuelLogResponse addFuelLog(FuelLogRequest request);

    List<FuelLogResponse> getAllFuelLogs();

    FuelLogResponse getFuelLogById(Long id);

    FuelLogResponse updateFuelLog(Long id, FuelLogRequest request);

    void deleteFuelLog(Long id);
}
