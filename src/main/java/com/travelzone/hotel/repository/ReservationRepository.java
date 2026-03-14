package com.travelzone.hotel.repository;

import com.travelzone.hotel.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
}
