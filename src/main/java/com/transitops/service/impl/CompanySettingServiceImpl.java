package com.transitops.service.impl;

import com.transitops.dto.request.CompanySettingRequest;
import com.transitops.dto.response.CompanySettingResponse;
import com.transitops.entity.CompanySetting;
import com.transitops.exception.ResourceNotFoundException;
import com.transitops.repository.CompanySettingRepository;
import com.transitops.service.CompanySettingService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CompanySettingServiceImpl implements CompanySettingService {

    private final CompanySettingRepository companySettingRepository;

    public CompanySettingServiceImpl(CompanySettingRepository companySettingRepository) {
        this.companySettingRepository = companySettingRepository;
    }

    @Override
    public CompanySettingResponse getCompanySetting() {
        CompanySetting setting = companySettingRepository.findById(1L)
                .orElseThrow(() -> new ResourceNotFoundException("Company profile not initialized"));
        return mapToResponse(setting);
    }

    @Override
    @Transactional
    public CompanySettingResponse updateCompanySetting(CompanySettingRequest request) {
        CompanySetting setting = companySettingRepository.findById(1L)
                .orElseThrow(() -> new ResourceNotFoundException("Company profile not initialized"));

        setting.setCompanyName(request.getCompanyName());
        setting.setLogo(request.getLogo());
        setting.setGstNumber(request.getGstNumber());
        setting.setPanNumber(request.getPanNumber());
        setting.setTransportLicenseNo(request.getTransportLicenseNo());
        setting.setAddress(request.getAddress());
        setting.setPhoneNumber(request.getPhoneNumber());
        setting.setEmail(request.getEmail());
        setting.setWebsite(request.getWebsite());
        setting.setWorkingHours(request.getWorkingHours());
        setting.setTimezone(request.getTimezone());
        setting.setCurrency(request.getCurrency());
        setting.setFiscalYear(request.getFiscalYear());
        setting.setDefaultFuelPrice(request.getDefaultFuelPrice());
        setting.setDefaultMaintenanceInterval(request.getDefaultMaintenanceInterval());

        CompanySetting updated = companySettingRepository.save(setting);
        return mapToResponse(updated);
    }

    private CompanySettingResponse mapToResponse(CompanySetting setting) {
        return CompanySettingResponse.builder()
                .id(setting.getId())
                .companyName(setting.getCompanyName())
                .logo(setting.getLogo())
                .gstNumber(setting.getGstNumber())
                .panNumber(setting.getPanNumber())
                .transportLicenseNo(setting.getTransportLicenseNo())
                .address(setting.getAddress())
                .phoneNumber(setting.getPhoneNumber())
                .email(setting.getEmail())
                .website(setting.getWebsite())
                .workingHours(setting.getWorkingHours())
                .timezone(setting.getTimezone())
                .currency(setting.getCurrency())
                .fiscalYear(setting.getFiscalYear())
                .defaultFuelPrice(setting.getDefaultFuelPrice())
                .defaultMaintenanceInterval(setting.getDefaultMaintenanceInterval())
                .build();
    }
}
