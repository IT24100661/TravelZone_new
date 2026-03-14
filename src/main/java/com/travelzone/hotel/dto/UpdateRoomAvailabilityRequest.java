package com.travelzone.hotel.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;

public class UpdateRoomAvailabilityRequest {

    @NotNull(message = "Available flag is required")
    private Boolean available;

    @NotNull(message = "Room count is required")
    @Min(value = 0, message = "Room count cannot be negative")
    private Integer roomCount;

    @NotNull(message = "Available count is required")
    @Min(value = 0, message = "Available count cannot be negative")
    private Integer availableCount;

    @NotNull(message = "Price is required")
    private BigDecimal pricePerNight;

    public UpdateRoomAvailabilityRequest() {
    }

    public Boolean getAvailable() {
        return available;
    }

    public Integer getRoomCount() {
        return roomCount;
    }

    public Integer getAvailableCount() {
        return availableCount;
    }

    public BigDecimal getPricePerNight() {
        return pricePerNight;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    public void setRoomCount(Integer roomCount) {
        this.roomCount = roomCount;
    }

    public void setAvailableCount(Integer availableCount) {
        this.availableCount = availableCount;
    }

    public void setPricePerNight(BigDecimal pricePerNight) {
        this.pricePerNight = pricePerNight;
    }
}
