package com.transitops.controller;

import com.transitops.dto.request.LoginRequest;
import com.transitops.dto.request.RegisterRequest;
import com.transitops.dto.response.AuthResponse;
import com.transitops.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/auth/register")
    public ResponseEntity<String> register(@Valid @RequestBody RegisterRequest request) {

        String response = authService.register(request);

        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }
    @PostMapping("/auth/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {

        return ResponseEntity.ok(authService.login(request));
    }

    @GetMapping("/profile")
    public ResponseEntity<com.transitops.dto.response.UserProfileResponse> getProfile(java.security.Principal principal) {
        return ResponseEntity.ok(authService.getProfile(principal.getName()));
    }

    @PutMapping("/profile")
    public ResponseEntity<com.transitops.dto.response.UserProfileResponse> updateProfile(
            java.security.Principal principal,
            @Valid @RequestBody com.transitops.dto.request.ProfileRequest request) {
        return ResponseEntity.ok(authService.updateProfile(principal.getName(), request));
    }

}