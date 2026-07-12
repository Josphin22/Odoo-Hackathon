package com.transitops.repository;

import com.transitops.entity.RoleHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RoleHistoryRepository extends JpaRepository<RoleHistory, Long> {
    List<RoleHistory> findByEmployeeIdOrderByChangedOnDesc(Long employeeId);
}
