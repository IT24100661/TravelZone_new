package com.travelzone.hotel.repository;

import com.travelzone.hotel.entity.Hotel;
import com.travelzone.hotel.entity.HotelImage;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HotelImageRepository extends JpaRepository<HotelImage, Long> {
    List<HotelImage> findByHotel(Hotel hotel);
}
