package com.travelzone.user.controller;

import com.travelzone.user.dto.UpdateProfileRequest;
import com.travelzone.user.dto.UserProfileResponse;
import com.travelzone.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> getProfile(@PathVariable Long userId, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));

        return ResponseEntity.ok(userService.getProfile(userId, authentication.getName(), isAdmin));
    }

    @PutMapping("/{userId}")
    public ResponseEntity<UserProfileResponse> updateProfile(@PathVariable Long userId,
                                                             @Valid @RequestBody UpdateProfileRequest request,
                                                             Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));

        return ResponseEntity.ok(userService.updateProfile(userId, request, authentication.getName(), isAdmin));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<?> deleteUser(@PathVariable Long userId, Authentication authentication) {
        boolean isAdmin = authentication.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));

        return ResponseEntity.ok().body(userService.deleteUser(userId, authentication.getName(), isAdmin));
    }
}
