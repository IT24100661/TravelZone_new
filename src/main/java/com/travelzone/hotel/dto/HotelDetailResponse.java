package com.travelzone.hotel.dto;

import java.util.List;

public class HotelDetailResponse {

    private Long hotelId;
    private String name;
    private String location;
    private String description;
    private List<String> facilities;
    private Double rating;
    private List<HotelImageResponse> images;
    private List<RoomResponse> rooms;

    public HotelDetailResponse(Long hotelId, String name, String location, String description,
                               List<String> facilities, Double rating, List<HotelImageResponse> images,
                               List<RoomResponse> rooms) {
        this.hotelId = hotelId;
        this.name = name;
        this.location = location;
        this.description = description;
        this.facilities = facilities;
        this.rating = rating;
        this.images = images;
        this.rooms = rooms;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public String getName() {
        return name;
    }

    public String getLocation() {
        return location;
    }

    public String getDescription() {
        return description;
    }

    public List<String> getFacilities() {
        return facilities;
    }

    public Double getRating() {
        return rating;
    }

    public List<HotelImageResponse> getImages() {
        return images;
    }

    public List<RoomResponse> getRooms() {
        return rooms;
    }
}
