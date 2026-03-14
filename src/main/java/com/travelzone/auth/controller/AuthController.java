package com.travelzone.auth.controller;

import com.travelzone.auth.dto.AuthResponse;
import com.travelzone.auth.dto.RegisterRequest;
import com.travelzone.auth.dto.ResetPasswordRequest;
import com.travelzone.auth.dto.VerifyEmailRequest;
import com.travelzone.common.dto.ApiResponse;
import com.travelzone.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(authService.register(request));
    }

    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse> verifyEmail(@Valid @RequestBody VerifyEmailRequest request) {
        return ResponseEntity.ok(new ApiResponse(true, authService.verifyEmail(request)));
    }

    @PutMapping("/reset-password")
    public ResponseEntity<ApiResponse> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(new ApiResponse(true, authService.resetPassword(request)));
    }
}
