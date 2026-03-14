package com.travelzone.user.dto;

import com.travelzone.common.enums.Role;

public class UserProfileResponse {
    private Long id;
    private String name;
    private String email;
    private Role role;
    private String phone;
    private String profilePicture;
    private String bio;
    private boolean verified;

    public UserProfileResponse() {
    }

    public UserProfileResponse(Long id, String name, String email, Role role, String phone, String profilePicture, String bio, boolean verified) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.role = role;
        this.phone = phone;
        this.profilePicture = profilePicture;
        this.bio = bio;
        this.verified = verified;
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public String getEmail() {
        return email;
    }

    public Role getRole() {
        return role;
    }

    public String getPhone() {
        return phone;
    }

    public String getProfilePicture() {
        return profilePicture;
    }

    public String getBio() {
        return bio;
    }

    public boolean isVerified() {
        return verified;
    }
}
