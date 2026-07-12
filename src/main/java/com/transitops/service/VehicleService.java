package com.transitops.service;

import com.transitops.dto.request.VehicleRequest;
import com.transitops.dto.response.VehicleResponse;

import java.util.List;

public interface VehicleService {

    VehicleResponse addVehicle(VehicleRequest request);

    List<VehicleResponse> getAllVehicles();

    VehicleResponse getVehicleById(Long id);

    VehicleResponse updateVehicle(Long id, VehicleRequest request);

    void deleteVehicle(Long id);
}