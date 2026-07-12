package com.transitops.service;

import com.transitops.dto.request.RoleRequest;
import com.transitops.dto.response.RoleResponse;
import java.util.List;

public interface RoleService {
    List<RoleResponse> getAllRoles();
    RoleResponse getRoleById(Long id);
    RoleResponse createRole(RoleRequest request);
    RoleResponse updateRole(Long id, RoleRequest request);
    void deleteRole(Long id);
}
