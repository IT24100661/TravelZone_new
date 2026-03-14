package com.travelzone.user.service;

import com.travelzone.auth.entity.VerificationToken;
import com.travelzone.auth.repository.VerificationTokenRepository;
import com.travelzone.exception.BadRequestException;
import com.travelzone.exception.ResourceNotFoundException;
import com.travelzone.exception.UnauthorizedException;
import com.travelzone.notification.service.EmailService;
import com.travelzone.user.dto.UpdateProfileRequest;
import com.travelzone.user.dto.UserProfileResponse;
import com.travelzone.user.entity.User;
import com.travelzone.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final VerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;

    public UserService(UserRepository userRepository,
                       VerificationTokenRepository verificationTokenRepository,
                       EmailService emailService) {
        this.userRepository = userRepository;
        this.verificationTokenRepository = verificationTokenRepository;
        this.emailService = emailService;
    }

    public UserProfileResponse getProfile(Long userId, String requesterEmail, boolean isAdmin) {
        User requester = userRepository.findByEmailAndDeletedFalse(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Requester not found"));

        if (!isAdmin && !requester.getId().equals(userId)) {
            throw new UnauthorizedException("You can only view your own profile");
        }

        User user = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return new UserProfileResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRole(),
                user.getPhone(),
                user.getProfilePicture(),
                user.getBio(),
                user.isVerified()
        );
    }

    public UserProfileResponse updateProfile(Long userId, UpdateProfileRequest request, String requesterEmail, boolean isAdmin) {
        User requester = userRepository.findByEmailAndDeletedFalse(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Requester not found"));

        if (!isAdmin && !requester.getId().equals(userId)) {
            throw new UnauthorizedException("You can only update your own profile");
        }

        User user = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!user.getEmail().equals(request.getEmail()) && userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already exists");
        }

        boolean emailChanged = !user.getEmail().equals(request.getEmail());

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setProfilePicture(request.getProfilePicture());
        user.setBio(request.getBio());

        if (emailChanged) {
            user.setVerified(false);
        }

        User updated = userRepository.save(user);

        if (emailChanged) {
            String tokenValue = UUID.randomUUID().toString();
            VerificationToken token = new VerificationToken(
                    tokenValue,
                    updated,
                    LocalDateTime.now().plusHours(24)
            );
            verificationTokenRepository.save(token);
            emailService.sendVerificationEmail(updated.getEmail(), tokenValue);
        }

        return new UserProfileResponse(
                updated.getId(),
                updated.getName(),
                updated.getEmail(),
                updated.getRole(),
                updated.getPhone(),
                updated.getProfilePicture(),
                updated.getBio(),
                updated.isVerified()
        );
    }

    public String deleteUser(Long userId, String requesterEmail, boolean isAdmin) {
        User requester = userRepository.findByEmailAndDeletedFalse(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Requester not found"));

        if (!isAdmin && !requester.getId().equals(userId)) {
            throw new UnauthorizedException("You can only delete your own account");
        }

        User user = userRepository.findByIdAndDeletedFalse(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setDeleted(true);
        userRepository.save(user);

        return "User account deleted successfully";
    }
}
