package com.travelzone.hotel.dto;

import java.math.BigDecimal;

public class HotelSearchResponse {

    private Long hotelId;
    private String name;
    private String location;
    private String thumbnailImage;
    private Double rating;
    private BigDecimal minPrice;

    public HotelSearchResponse(Long hotelId, String name, String location, String thumbnailImage, Double rating, BigDecimal minPrice) {
        this.hotelId = hotelId;
        this.name = name;
        this.location = location;
        this.thumbnailImage = thumbnailImage;
        this.rating = rating;
        this.minPrice = minPrice;
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

    public String getThumbnailImage() {
        return thumbnailImage;
    }

    public Double getRating() {
        return rating;
    }

    public BigDecimal getMinPrice() {
        return minPrice;
    }
}
