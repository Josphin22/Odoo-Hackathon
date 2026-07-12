package com.transitops.service.impl;

import com.transitops.dto.request.EmployeeRequest;
import com.transitops.dto.response.EmployeeResponse;
import com.transitops.entity.*;
import com.transitops.exception.BadRequestException;
import com.transitops.exception.ResourceNotFoundException;
import com.transitops.repository.*;
import com.transitops.service.UserService;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final DriverRepository driverRepository;
    private final TripRepository tripRepository;
    private final RoleHistoryRepository roleHistoryRepository;
    private final AuditLogRepository auditLogRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           DriverRepository driverRepository,
                           TripRepository tripRepository,
                           RoleHistoryRepository roleHistoryRepository,
                           AuditLogRepository auditLogRepository,
                           PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.driverRepository = driverRepository;
        this.tripRepository = tripRepository;
        this.roleHistoryRepository = roleHistoryRepository;
        this.auditLogRepository = auditLogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public List<EmployeeResponse> getAllEmployees() {
        return userRepository.findAllByIsDeletedFalse().stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public List<EmployeeResponse> searchEmployees(String query) {
        if (query == null || query.trim().isEmpty()) {
            return getAllEmployees();
        }
        return userRepository.searchEmployees(query.trim()).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Override
    public EmployeeResponse getEmployeeById(Long id) {
        User user = userRepository.findById(id)
                .filter(u -> !u.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public EmployeeResponse createEmployee(EmployeeRequest request) {
        if (userRepository.existsByEmailAndIsDeletedFalse(request.getEmail())) {
            throw new BadRequestException("Employee already exists with email: " + request.getEmail());
        }

        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new BadRequestException("Temporary password is required for new employees");
        }
        validatePasswordStrength(request.getPassword());

        Role role = roleRepository.findByName(request.getRole().toUpperCase().trim())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getRole()));

        String empId = generateNextEmployeeId();

        User user = User.builder()
                .employeeId(empId)
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .department(request.getDepartment())
                .status(request.getStatus().toUpperCase())
                .dob(request.getDob() != null ? LocalDate.parse(request.getDob()) : null)
                .emergencyContact(request.getEmergencyContact())
                .bloodGroup(request.getBloodGroup())
                .nationality(request.getNationality())
                .aadhaarNumber(request.getAadhaarNumber())
                .remarks(request.getRemarks())
                .isDeleted(false)
                .isLocked(false)
                .failedLoginAttempts(0)
                .forcePasswordChange(true)
                .role(role)
                .build();

        User savedUser = userRepository.save(user);

        if (role.getName().equalsIgnoreCase("DRIVER")) {
            if (request.getLicenseNumber() == null || request.getLicenseNumber().trim().isEmpty()) {
                throw new BadRequestException("License number is required for Driver employees");
            }
            Driver driver = Driver.builder()
                    .fullName(savedUser.getFullName())
                    .licenseNumber(request.getLicenseNumber())
                    .licenseCategory(request.getLicenseCategory() != null ? request.getLicenseCategory() : "Class A CDL")
                    .licenseExpiryDate(request.getLicenseExpiryDate() != null ? LocalDate.parse(request.getLicenseExpiryDate()) : LocalDate.now().plusYears(3))
                    .phoneNumber(savedUser.getPhoneNumber() != null ? savedUser.getPhoneNumber() : "000000000")
                    .safetyScore(request.getSafetyScore() != null ? request.getSafetyScore() : 100)
                    .status("Available")
                    .user(savedUser)
                    .build();
            driverRepository.save(driver);
        }

        logAdminAction("CREATE_EMPLOYEE", savedUser.getEmail(), null, savedUser.toString(), "SUCCESS");
        return mapToResponse(savedUser);
    }

    @Override
    @Transactional
    public EmployeeResponse updateEmployee(Long id, EmployeeRequest request) {
        User user = userRepository.findById(id)
                .filter(u -> !u.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        String currentAdmin = SecurityContextHolder.getContext().getAuthentication().getName();

        if (user.getEmail().equalsIgnoreCase(currentAdmin)) {
            if (!request.getStatus().equalsIgnoreCase(user.getStatus())) {
                throw new BadRequestException("Self-deactivation / status changes are not allowed for ADMIN account");
            }
            if (!request.getRole().equalsIgnoreCase(user.getRole().getName())) {
                throw new BadRequestException("ADMIN accounts cannot modify their own security roles");
            }
        }

        String oldUserVal = user.toString();

        if (!request.getRole().equalsIgnoreCase(user.getRole().getName()) || !request.getStatus().equalsIgnoreCase(user.getStatus())) {
            verifyLastAdminSafeGuard(user.getEmail(), request.getRole(), request.getStatus());
        }

        if (!request.getRole().equalsIgnoreCase(user.getRole().getName())) {
            Role newRole = roleRepository.findByName(request.getRole().toUpperCase().trim())
                    .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + request.getRole()));

            RoleHistory history = RoleHistory.builder()
                    .employee(user)
                    .oldRole(user.getRole().getName())
                    .newRole(newRole.getName())
                    .changedBy(currentAdmin)
                    .changedOn(LocalDateTime.now())
                    .build();
            roleHistoryRepository.save(history);

            user.setRole(newRole);
        }

        user.setFullName(request.getFullName());
        user.setPhoneNumber(request.getPhoneNumber());
        user.setDepartment(request.getDepartment());
        user.setStatus(request.getStatus().toUpperCase());
        if (request.getDob() != null) user.setDob(LocalDate.parse(request.getDob()));
        user.setEmergencyContact(request.getEmergencyContact());
        user.setBloodGroup(request.getBloodGroup());
        user.setNationality(request.getNationality());
        user.setAadhaarNumber(request.getAadhaarNumber());
        user.setRemarks(request.getRemarks());

        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            validatePasswordStrength(request.getPassword());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setForcePasswordChange(true);
        }

        User updatedUser = userRepository.save(user);

        // Sync or Create Driver Profile
        if (updatedUser.getRole().getName().equalsIgnoreCase("DRIVER")) {
            Driver driver = driverRepository.findByUserId(updatedUser.getId())
                    .orElseGet(() -> Driver.builder().user(updatedUser).status("Available").safetyScore(100).build());

            driver.setFullName(updatedUser.getFullName());
            driver.setPhoneNumber(updatedUser.getPhoneNumber() != null ? updatedUser.getPhoneNumber() : "000000000");
            
            if (request.getLicenseNumber() != null) driver.setLicenseNumber(request.getLicenseNumber());
            else if (driver.getLicenseNumber() == null) driver.setLicenseNumber("DL-PENDING");

            if (request.getLicenseCategory() != null) driver.setLicenseCategory(request.getLicenseCategory());
            else if (driver.getLicenseCategory() == null) driver.setLicenseCategory("Class A CDL");

            if (request.getLicenseExpiryDate() != null) driver.setLicenseExpiryDate(LocalDate.parse(request.getLicenseExpiryDate()));
            else if (driver.getLicenseExpiryDate() == null) driver.setLicenseExpiryDate(LocalDate.now().plusYears(3));

            if (request.getSafetyScore() != null) driver.setSafetyScore(request.getSafetyScore());

            driverRepository.save(driver);
        }

        logAdminAction("UPDATE_EMPLOYEE", updatedUser.getEmail(), oldUserVal, updatedUser.toString(), "SUCCESS");
        return mapToResponse(updatedUser);
    }

    @Override
    @Transactional
    public void deleteEmployee(Long id) {
        User user = userRepository.findById(id)
                .filter(u -> !u.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        String currentAdmin = SecurityContextHolder.getContext().getAuthentication().getName();

        if (user.getEmail().equalsIgnoreCase(currentAdmin)) {
            throw new BadRequestException("ADMIN account lockout protection: You cannot delete your own account while logged in.");
        }

        verifyLastAdminSafeGuard(user.getEmail(), "DRIVER", "INACTIVE");

        if (user.getRole().getName().equalsIgnoreCase("DRIVER")) {
            Driver driver = driverRepository.findByUserId(user.getId()).orElse(null);
            if (driver != null) {
                List<Trip> activeTrips = tripRepository.findByDriverId(driver.getId());
                boolean hasActiveTrips = activeTrips.stream()
                        .anyMatch(t -> !"Completed".equalsIgnoreCase(t.getStatus()) && !"Cancelled".equalsIgnoreCase(t.getStatus()));
                if (hasActiveTrips) {
                    throw new BadRequestException("Cannot delete driver: They have active trips assigned. Reassign trips first.");
                }
            }
        }

        user.setIsDeleted(true);
        userRepository.save(user);

        logAdminAction("DELETE_EMPLOYEE", user.getEmail(), "isDeleted=false", "isDeleted=true", "SUCCESS");
    }

    @Override
    @Transactional
    public void unlockEmployee(Long id) {
        User user = userRepository.findById(id)
                .filter(u -> !u.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        user.setIsLocked(false);
        user.setFailedLoginAttempts(0);
        user.setStatus("ACTIVE");
        userRepository.save(user);

        logAdminAction("UNLOCK_EMPLOYEE", user.getEmail(), "Locked", "Unlocked / Active", "SUCCESS");
    }

    @Override
    @Transactional
    public void resetEmployeePassword(Long id, String newPassword) {
        User user = userRepository.findById(id)
                .filter(u -> !u.getIsDeleted())
                .orElseThrow(() -> new ResourceNotFoundException("Employee not found"));

        validatePasswordStrength(newPassword);
        user.setPassword(passwordEncoder.encode(newPassword));
        user.setForcePasswordChange(true);
        userRepository.save(user);

        logAdminAction("RESET_PASSWORD", user.getEmail(), null, "Password reset with forcePasswordChange", "SUCCESS");
    }

    private void verifyLastAdminSafeGuard(String targetEmail, String targetRole, String targetStatus) {
        User target = userRepository.findByEmail(targetEmail).orElse(null);
        if (target != null && target.getRole().getName().equalsIgnoreCase("ADMIN")) {
            List<User> activeAdmins = userRepository.findAllByIsDeletedFalse().stream()
                    .filter(u -> u.getRole().getName().equalsIgnoreCase("ADMIN") && "ACTIVE".equalsIgnoreCase(u.getStatus()))
                    .toList();

            if (activeAdmins.size() <= 1 && activeAdmins.stream().anyMatch(a -> a.getEmail().equalsIgnoreCase(targetEmail))) {
                if (!targetRole.equalsIgnoreCase("ADMIN") || !"ACTIVE".equalsIgnoreCase(targetStatus)) {
                    throw new BadRequestException("Action rejected. The system must always contain at least one active ADMIN.");
                }
            }
        }
    }

    private void validatePasswordStrength(String password) {
        if (password == null || password.length() < 8) {
            throw new BadRequestException("Password must be at least 8 characters long");
        }
        boolean hasUpper = password.chars().anyMatch(Character::isUpperCase);
        boolean hasLower = password.chars().anyMatch(Character::isLowerCase);
        boolean hasDigit = password.chars().anyMatch(Character::isDigit);
        boolean hasSpecial = password.chars().anyMatch(ch -> "!@#$%^&*()_+={}[];:<>?,-.".indexOf(ch) >= 0);
        if (!hasUpper || !hasLower || !hasDigit || !hasSpecial) {
            throw new BadRequestException("Password must contain at least one uppercase, one lowercase, one digit, and one special character.");
        }
    }

    private String generateNextEmployeeId() {
        long count = userRepository.count();
        return String.format("TOPS-EMP-%04d", count + 1);
    }

    private void logAdminAction(String action, String target, String oldVal, String newVal, String status) {
        String adminEmail = "SYSTEM";
        String adminName = "System Initializer";
        if (SecurityContextHolder.getContext().getAuthentication() != null && SecurityContextHolder.getContext().getAuthentication().isAuthenticated()) {
            adminEmail = SecurityContextHolder.getContext().getAuthentication().getName();
            adminName = adminEmail;
        }

        AuditLog log = AuditLog.builder()
                .adminName(adminName)
                .adminEmail(adminEmail)
                .action(action)
                .targetUser(target)
                .oldValue(oldVal)
                .newValue(newVal)
                .timestamp(LocalDateTime.now())
                .status(status)
                .ipAddress("127.0.0.1")
                .browser("Server Agent")
                .build();
        auditLogRepository.save(log);
    }

    private EmployeeResponse mapToResponse(User user) {
        EmployeeResponse.EmployeeResponseBuilder builder = EmployeeResponse.builder()
                .id(user.getId())
                .employeeId(user.getEmployeeId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .department(user.getDepartment())
                .role(user.getRole().getName())
                .status(user.getStatus())
                .dob(user.getDob() != null ? user.getDob().toString() : null)
                .emergencyContact(user.getEmergencyContact())
                .bloodGroup(user.getBloodGroup())
                .nationality(user.getNationality())
                .aadhaarNumber(user.getAadhaarNumber())
                .remarks(user.getRemarks())
                .isLocked(user.getIsLocked())
                .forcePasswordChange(user.getForcePasswordChange());

        if (user.getRole().getName().equalsIgnoreCase("DRIVER")) {
            Driver driver = driverRepository.findByUserId(user.getId()).orElse(null);
            if (driver != null) {
                builder.driverProfileId(driver.getId())
                        .licenseNumber(driver.getLicenseNumber())
                        .licenseCategory(driver.getLicenseCategory())
                        .licenseExpiryDate(driver.getLicenseExpiryDate() != null ? driver.getLicenseExpiryDate().toString() : null)
                        .safetyScore(driver.getSafetyScore());
            }
        }
        return builder.build();
    }
}
