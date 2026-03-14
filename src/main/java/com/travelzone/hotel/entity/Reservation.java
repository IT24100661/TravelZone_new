package com.travelzone.hotel.entity;

import com.travelzone.common.enums.BookingStatus;
import com.travelzone.user.entity.User;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reservations")
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "hotel_id", nullable = false)
    private Hotel hotel;

    @ManyToOne
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @ManyToOne
    @JoinColumn(name = "tourist_id", nullable = false)
    private User tourist;

    @Column(nullable = false)
    private LocalDate checkIn;

    @Column(nullable = false)
    private LocalDate checkOut;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal totalPrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public Reservation() {
    }

    public Long getId() {
        return id;
    }

    public Hotel getHotel() {
        return hotel;
    }

    public Room getRoom() {
        return room;
    }

    public User getTourist() {
        return tourist;
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

    public void setHotel(Hotel hotel) {
        this.hotel = hotel;
    }

    public void setRoom(Room room) {
        this.room = room;
    }

    public void setTourist(User tourist) {
        this.tourist = tourist;
    }

    public void setCheckIn(LocalDate checkIn) {
        this.checkIn = checkIn;
    }

    public void setCheckOut(LocalDate checkOut) {
        this.checkOut = checkOut;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }

    public void setStatus(BookingStatus status) {
        this.status = status;
    }
}
