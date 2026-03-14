package com.travelzone.hotel.entity;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "rooms")
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @Column(nullable = false)
    private String roomType;

    @Column(nullable = false)
    private Integer roomCount;

    @Column(nullable = false)
    private Integer availableCount;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal pricePerNight;

    @Column(nullable = false)
    private boolean available = true;

    public Room() {
    }

    public Long getId() {
        return id;
    }

    public Hotel getHotel() {
        return hotel;
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

    public void setHotel(Hotel hotel) {
        this.hotel = hotel;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
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

    public void setAvailable(boolean available) {
        this.available = available;
    }
}
