package com.travelzone.auth.service;

import com.travelzone.auth.dto.AuthResponse;
import com.travelzone.auth.dto.RegisterRequest;
import com.travelzone.auth.dto.ResetPasswordRequest;
import com.travelzone.auth.dto.VerifyEmailRequest;
import com.travelzone.auth.entity.VerificationToken;
import com.travelzone.auth.repository.VerificationTokenRepository;
import com.travelzone.exception.BadRequestException;
import com.travelzone.notification.service.EmailService;
import com.travelzone.security.JwtService;
import com.travelzone.user.entity.User;
import com.travelzone.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final JwtService jwtService;

    public AuthService(UserRepository userRepository,
                       VerificationTokenRepository verificationTokenRepository,
                       PasswordEncoder passwordEncoder,
                       EmailService emailService,
                       JwtService jwtService) {
        this.userRepository = userRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.emailService = emailService;
        this.jwtService = jwtService;
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());
        user.setVerified(false);

        User savedUser = userRepository.save(user);

        String tokenValue = UUID.randomUUID().toString();
        VerificationToken token = new VerificationToken(
                tokenValue,
                savedUser,
                LocalDateTime.now().plusHours(24)
        );
        verificationTokenRepository.save(token);
        emailService.sendVerificationEmail(savedUser.getEmail(), tokenValue);

        String jwt = jwtService.generateToken(savedUser.getEmail());
        return new AuthResponse("User registered successfully. Verification email sent.", jwt);
    }

    public String verifyEmail(VerifyEmailRequest request) {
        VerificationToken token = verificationTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid verification token"));

        if (token.isUsed()) {
            throw new BadRequestException("Token already used");
        }

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Token expired");
        }

        User user = token.getUser();
        user.setVerified(true);
        userRepository.save(user);

        token.setUsed(true);
        verificationTokenRepository.save(token);

        return "Email verified successfully";
    }

    public String resetPassword(ResetPasswordRequest request) {
        VerificationToken token = verificationTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new BadRequestException("Invalid reset token"));

        if (token.isUsed()) {
            throw new BadRequestException("Token already used");
        }

        if (token.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Token expired");
        }

        User user = token.getUser();
        if (passwordEncoder.matches(request.getNewPassword(), user.getPassword())) {
            throw new BadRequestException("New password must be different from old password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);

        token.setUsed(true);
        verificationTokenRepository.save(token);

        return "Password reset successfully";
    }
}
