package com.travelzone.hotel.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public class CreateHotelRequest {

    @NotBlank(message = "Hotel name is required")
    private String name;

    @NotBlank(message = "Location is required")
    private String location;

    @NotBlank(message = "Description is required")
    private String description;

    @NotEmpty(message = "At least one facility is required")
    private List<String> facilities;

    @NotEmpty(message = "At least one image is required")
    private List<String> images;

    public CreateHotelRequest() {
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

    public List<String> getImages() {
        return images;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setFacilities(List<String> facilities) {
        this.facilities = facilities;
    }

    public void setImages(List<String> images) {
        this.images = images;
    }
}
