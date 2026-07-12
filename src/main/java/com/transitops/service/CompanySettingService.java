package com.transitops.service;

import com.transitops.dto.request.CompanySettingRequest;
import com.transitops.dto.response.CompanySettingResponse;

public interface CompanySettingService {
    CompanySettingResponse getCompanySetting();
    CompanySettingResponse updateCompanySetting(CompanySettingRequest request);
}
