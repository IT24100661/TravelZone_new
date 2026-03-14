package com.travelzone.notification.service;

import org.springframework.stereotype.Service;

@Service
public class EmailService {

    public void sendVerificationEmail(String to, String token) {
        System.out.println("Verification email sent to: " + to + " token: " + token);
    }
}
