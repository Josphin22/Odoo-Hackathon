package com.transitops.service.impl;

import com.transitops.dto.response.DashboardResponse;
import com.transitops.repository.DriverRepository;
import com.transitops.repository.TripRepository;
import com.transitops.repository.VehicleRepository;
import com.transitops.service.DashboardService;
import org.springframework.stereotype.Service;

@Service
public class DashboardServiceImpl implements DashboardService {

    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;

    public DashboardServiceImpl(
            VehicleRepository vehicleRepository,
            DriverRepository driverRepository,
            TripRepository tripRepository) {

        this.vehicleRepository = vehicleRepository;
        this.driverRepository = driverRepository;
        this.tripRepository = tripRepository;
    }

    @Override
    public DashboardResponse getDashboard() {

        return DashboardResponse.builder()
                .totalVehicles(vehicleRepository.count())
                .totalDrivers(driverRepository.count())
                .totalTrips(tripRepository.count())
                .availableVehicles(vehicleRepository.countByStatus("AVAILABLE"))
                .availableDrivers(driverRepository.countByStatus("AVAILABLE"))
                .build();
    }
}