package com.transitops.service.impl;

import com.transitops.dto.request.RoleRequest;
import com.transitops.dto.response.RoleResponse;
import com.transitops.entity.Permission;
import com.transitops.entity.Role;
import com.transitops.exception.BadRequestException;
import com.transitops.exception.ResourceNotFoundException;
import com.transitops.repository.PermissionRepository;
import com.transitops.repository.RoleRepository;
import com.transitops.repository.UserRepository;
import com.transitops.service.RoleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class RoleServiceImpl implements RoleService {

    private final RoleRepository roleRepository;
    private final PermissionRepository permissionRepository;
    private final UserRepository userRepository;

    public RoleServiceImpl(RoleRepository roleRepository,
                           PermissionRepository permissionRepository,
                           UserRepository userRepository) {
        this.roleRepository = roleRepository;
        this.permissionRepository = permissionRepository;
        this.userRepository = userRepository;
    }

    @Override
    public List<RoleResponse> getAllRoles() {
        return roleRepository.findAll().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public RoleResponse getRoleById(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));
        return mapToResponse(role);
    }

    @Override
    @Transactional
    public RoleResponse createRole(RoleRequest request) {
        if (roleRepository.existsByName(request.getName())) {
            throw new BadRequestException("Role already exists with name: " + request.getName());
        }

        Role role = Role.builder()
                .name(request.getName().toUpperCase().trim())
                .description(request.getDescription())
                .isSystemRole(false)
                .permissions(mapPermissions(request.getPermissions()))
                .build();

        Role saved = roleRepository.save(role);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public RoleResponse updateRole(Long id, RoleRequest request) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        if (role.getIsSystemRole()) {
            // Permitting updating descriptions for system roles is okay, but system roles permissions matrix cannot be completely deleted, let's allow editing custom permissions
            if (!role.getName().equalsIgnoreCase("ADMIN") && request.getPermissions() != null) {
                role.setPermissions(mapPermissions(request.getPermissions()));
            }
            if (request.getDescription() != null) {
                role.setDescription(request.getDescription());
            }
        } else {
            role.setName(request.getName().toUpperCase().trim());
            role.setDescription(request.getDescription());
            if (request.getPermissions() != null) {
                role.setPermissions(mapPermissions(request.getPermissions()));
            }
        }

        Role updated = roleRepository.save(role);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteRole(Long id) {
        Role role = roleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        if (role.getIsSystemRole()) {
            throw new BadRequestException("System roles cannot be deleted");
        }

        long activeUsers = userRepository.countByRoleAndIsDeletedFalse(role);
        if (activeUsers > 0) {
            throw new BadRequestException("Role is currently assigned to " + activeUsers + " active employees. Reassign them before deleting.");
        }

        roleRepository.delete(role);
    }

    private RoleResponse mapToResponse(Role role) {
        long userCount = userRepository.countByRoleAndIsDeletedFalse(role);
        List<String> permissionStrings = role.getPermissions().stream()
                .map(perm -> perm.getModule() + "_" + perm.getAction())
                .toList();

        return RoleResponse.builder()
                .id(role.getId())
                .name(role.getName())
                .description(role.getDescription())
                .isSystemRole(role.getIsSystemRole())
                .numberOfUsers(userCount)
                .permissions(permissionStrings)
                .build();
    }

    private Set<Permission> mapPermissions(List<String> permStrings) {
        Set<Permission> perms = new HashSet<>();
        if (permStrings == null) return perms;

        for (String permStr : permStrings) {
            String[] parts = permStr.split("_", 2);
            if (parts.length == 2) {
                String module = parts[0];
                String action = parts[1];
                permissionRepository.findByModuleAndAction(module, action)
                        .stream().findFirst()
                        .ifPresent(perms::add);
            }
        }
        return perms;
    }
}
