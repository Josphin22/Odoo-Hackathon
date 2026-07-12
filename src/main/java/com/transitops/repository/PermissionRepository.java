package com.transitops.repository;

import com.transitops.entity.Permission;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PermissionRepository extends JpaRepository<Permission, Long> {
    List<Permission> findByModuleAndAction(String module, String action);
}
