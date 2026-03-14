package com.travelzone.hotel.dto;

import com.travelzone.common.enums.BookingStatus;

import java.math.BigDecimal;
import java.time.LocalDate;

public class ReservationResponse {

    private Long reservationId;
    private Long hotelId;
    private Long roomId;
    private Long touristId;
    private LocalDate checkIn;
    private LocalDate checkOut;
    private BigDecimal totalPrice;
    private BookingStatus status;

    public ReservationResponse(Long reservationId, Long hotelId, Long roomId, Long touristId,
                               LocalDate checkIn, LocalDate checkOut, BigDecimal totalPrice,
                               BookingStatus status) {
        this.reservationId = reservationId;
        this.hotelId = hotelId;
        this.roomId = roomId;
        this.touristId = touristId;
        this.checkIn = checkIn;
        this.checkOut = checkOut;
        this.totalPrice = totalPrice;
        this.status = status;
    }

    public Long getReservationId() {
        return reservationId;
    }

    public Long getHotelId() {
        return hotelId;
    }

    public Long getRoomId() {
        return roomId;
    }

    public Long getTouristId() {
        return touristId;
    }

    public LocalDate getCheckIn() {
        return checkIn;
    }

    public LocalDate getCheckOut() {
        return checkOut;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public BookingStatus getStatus() {
        return status;
    }
}
