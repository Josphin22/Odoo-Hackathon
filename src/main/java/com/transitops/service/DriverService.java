package com.transitops.service;

import com.transitops.dto.request.DriverRequest;
import com.transitops.dto.response.DriverResponse;

import java.util.List;

public interface DriverService {

    DriverResponse addDriver(DriverRequest request);

    List<DriverResponse> getAllDrivers();

    DriverResponse getDriverById(Long id);

    DriverResponse updateDriver(Long id, DriverRequest request);

    void deleteDriver(Long id);
}