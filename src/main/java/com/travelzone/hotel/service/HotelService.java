package com.travelzone.hotel.service;

import com.travelzone.common.enums.Role;
import com.travelzone.exception.ResourceNotFoundException;
import com.travelzone.exception.UnauthorizedException;
import com.travelzone.hotel.dto.*;
import com.travelzone.hotel.entity.Hotel;
import com.travelzone.hotel.entity.HotelImage;
import com.travelzone.hotel.entity.Room;
import com.travelzone.hotel.repository.HotelImageRepository;
import com.travelzone.hotel.repository.HotelRepository;
import com.travelzone.hotel.repository.RoomRepository;
import com.travelzone.user.entity.User;
import com.travelzone.user.repository.UserRepository;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class HotelService {

    private final HotelRepository hotelRepository;
    private final HotelImageRepository hotelImageRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;

    public HotelService(HotelRepository hotelRepository,
                        HotelImageRepository hotelImageRepository,
                        RoomRepository roomRepository,
                        UserRepository userRepository) {
        this.hotelRepository = hotelRepository;
        this.hotelImageRepository = hotelImageRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
    }

    public HotelDetailResponse createHotel(CreateHotelRequest request, String requesterEmail) {
        User owner = userRepository.findByEmailAndDeletedFalse(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (owner.getRole() != Role.HOTEL_OWNER) {
            throw new UnauthorizedException("Only HOTEL_OWNER can create hotel listings");
        }

        Hotel hotel = new Hotel();
        hotel.setOwner(owner);
        hotel.setName(request.getName());
        hotel.setLocation(request.getLocation());
        hotel.setDescription(request.getDescription());
        hotel.setFacilities(request.getFacilities());
        hotel.setActive(true);

        Hotel savedHotel = hotelRepository.save(hotel);

        for (String imageUrl : request.getImages()) {
            HotelImage image = new HotelImage();
            image.setHotel(savedHotel);
            image.setImageUrl(imageUrl);
            hotelImageRepository.save(image);
        }

        return getHotelDetails(savedHotel.getId());
    }

    public Page<HotelSearchResponse> searchHotels(String location, BigDecimal price, String facilities, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("rating").descending());
        String safeLocation = location == null ? "" : location;
        BigDecimal safePrice = price == null ? new BigDecimal("999999999") : price;

        Page<Hotel> hotels = hotelRepository.findByActiveTrueAndLocationContainingIgnoreCaseAndMinPriceLessThanEqual(
                safeLocation, safePrice, pageable
        );

        return hotels.map(hotel -> {
            List<HotelImage> images = hotelImageRepository.findByHotel(hotel);
            String thumbnail = images.isEmpty() ? null : images.get(0).getImageUrl();
            return new HotelSearchResponse(
                    hotel.getId(),
                    hotel.getName(),
                    hotel.getLocation(),
                    thumbnail,
                    hotel.getRating(),
                    hotel.getMinPrice()
            );
        });
    }

    public HotelDetailResponse getHotelDetails(Long hotelId) {
        Hotel hotel = hotelRepository.findById(hotelId)
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found"));

        if (!hotel.isActive()) {
            throw new ResourceNotFoundException("Hotel is not active");
        }

        List<HotelImageResponse> images = hotelImageRepository.findByHotel(hotel).stream()
                .map(img -> new HotelImageResponse(img.getId(), img.getImageUrl()))
                .toList();

        List<RoomResponse> rooms = roomRepository.findByHotelId(hotelId).stream()
                .map(room -> new RoomResponse(
                        room.getId(),
                        room.getRoomType(),
                        room.getRoomCount(),
                        room.getAvailableCount(),
                        room.getPricePerNight(),
                        room.isAvailable()
                )).toList();

        return new HotelDetailResponse(
                hotel.getId(),
                hotel.getName(),
                hotel.getLocation(),
                hotel.getDescription(),
                hotel.getFacilities(),
                hotel.getRating(),
                images,
                rooms
        );
    }
}
