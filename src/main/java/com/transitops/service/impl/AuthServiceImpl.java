package com.transitops.service.impl;

import com.transitops.dto.request.LoginRequest;
import com.transitops.dto.request.RegisterRequest;
import com.transitops.dto.response.AuthResponse;
import com.transitops.dto.response.UserProfileResponse;
import com.transitops.dto.request.ProfileRequest;
import com.transitops.entity.LoginHistory;
import com.transitops.entity.Role;
import com.transitops.entity.User;
import com.transitops.exception.BadRequestException;
import com.transitops.exception.ResourceNotFoundException;
import com.transitops.repository.LoginHistoryRepository;
import com.transitops.repository.RoleRepository;
import com.transitops.repository.UserRepository;
import com.transitops.service.AuthService;
import com.transitops.security.JwtService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final LoginHistoryRepository loginHistoryRepository;
    private final PasswordEncoder passwordEncoder;
    private final HttpServletRequest httpServletRequest;

    public AuthServiceImpl(UserRepository userRepository,
                           RoleRepository roleRepository,
                           LoginHistoryRepository loginHistoryRepository,
                           PasswordEncoder passwordEncoder,
                           JwtService jwtService,
                           HttpServletRequest httpServletRequest) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.loginHistoryRepository = loginHistoryRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.httpServletRequest = httpServletRequest;
    }

    @Override
    @Transactional
    public String register(RegisterRequest request) {
        validatePasswordStrength(request.getPassword());

        if (userRepository.existsByEmailAndIsDeletedFalse(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        Role role = roleRepository.findByName(request.getRole().name())
                .orElseThrow(() -> new ResourceNotFoundException("Role not found"));

        // Generate dynamic TOPS-EMP-XXXX format ID
        String empId = generateNextEmployeeId();

        User user = User.builder()
                .employeeId(empId)
                .fullName(request.getFullName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .role(role)
                .status("ACTIVE")
                .failedLoginAttempts(0)
                .isLocked(false)
                .isDeleted(false)
                .forcePasswordChange(false)
                .build();

        userRepository.save(user);
        return "User registered successfully";
    }

    @Override
    @Transactional
    public AuthResponse login(LoginRequest request) {
        String ip = httpServletRequest.getRemoteAddr();
        String userAgent = httpServletRequest.getHeader("User-Agent");
        // Parse simple OS/Browser names from user agent
        String os = parseOS(userAgent);
        String browser = parseBrowser(userAgent);

        User user = userRepository.findByEmailAndIsDeletedFalse(request.getEmail())
                .orElseThrow(() -> {
                    // Log failed login history for non-existing user
                    saveLoginHistory(request.getEmail(), ip, userAgent, os, browser, "FAILED", "Invalid email");
                    throw new BadRequestException("Invalid email or password");
                });

        if (user.getIsLocked()) {
            saveLoginHistory(user.getEmail(), ip, userAgent, os, browser, "FAILED", "Account locked");
            throw new BadRequestException("Account is locked due to repeated failed logins. Please contact your administrator.");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            int attempts = user.getFailedLoginAttempts() + 1;
            user.setFailedLoginAttempts(attempts);
            if (attempts >= 5) {
                user.setIsLocked(true);
                user.setStatus("SUSPENDED");
            }
            userRepository.save(user);

            saveLoginHistory(user.getEmail(), ip, userAgent, os, browser, "FAILED", "Invalid password");
            throw new BadRequestException("Invalid email or password");
        }

        // Reset failed login count on successful login
        user.setFailedLoginAttempts(0);
        userRepository.save(user);

        saveLoginHistory(user.getEmail(), ip, userAgent, os, browser, "SUCCESS", "Login successful");
        String token = jwtService.generateToken(user);

        return AuthResponse.builder()
                .token(token)
                .email(user.getEmail())
                .fullName(user.getFullName())
                .name(user.getFullName())
                .role(user.getRole().getName())
                .build();
    }

    @Override
    public UserProfileResponse getProfile(String email) {
        User user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return UserProfileResponse.builder()
                .name(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .build();
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(String email, ProfileRequest request) {
        User user = userRepository.findByEmailAndIsDeletedFalse(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setFullName(request.getName());
        if (request.getPassword() != null && !request.getPassword().trim().isEmpty()) {
            validatePasswordStrength(request.getPassword());
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setForcePasswordChange(false);
        }

        userRepository.save(user);

        return UserProfileResponse.builder()
                .name(user.getFullName())
                .email(user.getEmail())
                .role(user.getRole().getName())
                .build();
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

    private void saveLoginHistory(String email, String ip, String userAgent, String os, String browser, String status, String reason) {
        LoginHistory history = LoginHistory.builder()
                .username(email)
                .loginTime(LocalDateTime.now())
                .ipAddress(ip)
                .browser(browser)
                .operatingSystem(os)
                .device("PC")
                .country("India")
                .status(status)
                .logoutReason(reason)
                .build();
        loginHistoryRepository.save(history);
    }

    private String parseOS(String userAgent) {
        if (userAgent == null) return "Unknown";
        if (userAgent.contains("Windows")) return "Windows";
        if (userAgent.contains("Mac")) return "macOS";
        if (userAgent.contains("Linux")) return "Linux";
        if (userAgent.contains("Android")) return "Android";
        if (userAgent.contains("iPhone")) return "iOS";
        return "Unknown";
    }

    private String parseBrowser(String userAgent) {
        if (userAgent == null) return "Unknown";
        if (userAgent.contains("Chrome")) return "Chrome";
        if (userAgent.contains("Firefox")) return "Firefox";
        if (userAgent.contains("Safari")) return "Safari";
        if (userAgent.contains("Edge")) return "Edge";
        return "Unknown";
    }
}