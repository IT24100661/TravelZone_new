package com.travelzone.hotel.repository;

import com.travelzone.hotel.entity.Hotel;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.math.BigDecimal;

public interface HotelRepository extends JpaRepository<Hotel, Long> {
    Page<Hotel> findByActiveTrueAndLocationContainingIgnoreCaseAndMinPriceLessThanEqual(
            String location, BigDecimal price, Pageable pageable
    );
}
