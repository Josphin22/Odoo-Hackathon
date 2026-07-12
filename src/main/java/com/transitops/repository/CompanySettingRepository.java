package com.transitops.repository;

import com.transitops.entity.CompanySetting;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CompanySettingRepository extends JpaRepository<CompanySetting, Long> {
}
