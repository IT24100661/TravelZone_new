package com.travelzone.hotel.dto;

import java.math.BigDecimal;

public class RoomResponse {

    private Long roomId;
    private String roomType;
    private Integer roomCount;
    private Integer availableCount;
    private BigDecimal pricePerNight;
    private boolean available;

    public RoomResponse(Long roomId, String roomType, Integer roomCount, Integer availableCount,
                        BigDecimal pricePerNight, boolean available) {
        this.roomId = roomId;
        this.roomType = roomType;
        this.roomCount = roomCount;
        this.availableCount = availableCount;
        this.pricePerNight = pricePerNight;
        this.available = available;
    }

    public Long getRoomId() {
        return roomId;
    }

    public String getRoomType() {
        return roomType;
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

    public boolean isAvailable() {
        return available;
    }
}
