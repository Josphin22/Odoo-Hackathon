package com.transitops;

import com.transitops.dto.request.EmployeeRequest;
import com.transitops.entity.User;
import com.transitops.exception.BadRequestException;
import com.transitops.repository.UserRepository;
import com.transitops.service.UserService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.transaction.annotation.Transactional;

@SpringBootTest
@Transactional
class TransitopsApplicationTests {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @Test
    void contextLoads() {
        // Context loading verification
    }

    @Test
    @WithMockUser(username = "manu@transitops.com", roles = {"ADMIN"})
    void testEmployeeIdFormatAndCreation() {
        EmployeeRequest request = EmployeeRequest.builder()
                .fullName("Test Employee")
                .email("test.employee@transitops.com")
                .password("Password@123")
                .phoneNumber("+91-9988776655")
                .department("Safety")
                .role("SAFETY_OFFICER")
                .status("ACTIVE")
                .build();

        var response = userService.createEmployee(request);
        Assertions.assertNotNull(response.getEmployeeId());
        Assertions.assertTrue(response.getEmployeeId().startsWith("TOPS-EMP-"));
        Assertions.assertEquals("ACTIVE", response.getStatus());
    }

    @Test
    @WithMockUser(username = "manu@transitops.com", roles = {"ADMIN"})
    void testSelfDeletionGuard() {
        User admin = userRepository.findByEmail("manu@transitops.com").orElse(null);
        Assertions.assertNotNull(admin);

        // Deleting self ("manu@transitops.com") while logged in should throw BadRequestException
        Assertions.assertThrows(BadRequestException.class, () -> {
            userService.deleteEmployee(admin.getId());
        });
    }

    @Test
    @WithMockUser(username = "manu@transitops.com", roles = {"ADMIN"})
    void testLastAdminRoleDeactivationGuard() {
        User admin = userRepository.findByEmail("manu@transitops.com").orElse(null);
        Assertions.assertNotNull(admin);

        // Attempting to deactivate or change the role of the last active admin should fail
        EmployeeRequest request = EmployeeRequest.builder()
                .fullName(admin.getFullName())
                .email(admin.getEmail())
                .phoneNumber(admin.getPhoneNumber())
                .department(admin.getDepartment())
                .role("DRIVER") // Attempt role change to DRIVER
                .status("INACTIVE") // Attempt deactivation
                .build();

        Assertions.assertThrows(BadRequestException.class, () -> {
            userService.updateEmployee(admin.getId(), request);
        });
    }
}
