package com.travelzone.notification.service;

import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    public void notifyUser(String email, String message) {
        System.out.println("Notification sent to " + email + ": " + message);
    }
}
