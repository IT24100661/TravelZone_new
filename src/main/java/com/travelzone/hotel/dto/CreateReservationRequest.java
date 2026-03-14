package com.travelzone.hotel.dto;

import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

public class CreateReservationRequest {

    @NotNull(message = "Hotel id is required")
    private Long hotelId;

    @NotNull(message = "Room id is required")
    private Long roomId;

    @NotNull(message = "Check-in date is required")
    private LocalDate checkIn;

    @NotNull(message = "Check-out date is required")
    private LocalDate checkOut;

    public CreateReservationRequest() {
    }

    public Long getHotelId() {
        return hotelId;
    }

    public Long getRoomId() {
        return roomId;
    }

    public LocalDate getCheckIn() {
        return checkIn;
    }

    public LocalDate getCheckOut() {
        return checkOut;
    }

    public void setHotelId(Long hotelId) {
        this.hotelId = hotelId;
    }

    public void setRoomId(Long roomId) {
        this.roomId = roomId;
    }

    public void setCheckIn(LocalDate checkIn) {
        this.checkIn = checkIn;
    }

    public void setCheckOut(LocalDate checkOut) {
        this.checkOut = checkOut;
    }
}
