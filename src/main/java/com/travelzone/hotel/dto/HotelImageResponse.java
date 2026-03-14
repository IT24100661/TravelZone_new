package com.travelzone.hotel.dto;

public class HotelImageResponse {

    private Long id;
    private String imageUrl;

    public HotelImageResponse(Long id, String imageUrl) {
        this.id = id;
        this.imageUrl = imageUrl;
    }

    public Long getId() {
        return id;
    }

    public String getImageUrl() {
        return imageUrl;
    }
}
