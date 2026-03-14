package com.travelzone.hotel.service;

import com.travelzone.exception.BadRequestException;
import com.travelzone.exception.ResourceNotFoundException;
import com.travelzone.exception.UnauthorizedException;
import com.travelzone.hotel.dto.RoomResponse;
import com.travelzone.hotel.dto.UpdateRoomAvailabilityRequest;
import com.travelzone.hotel.entity.Reservation;
import com.travelzone.hotel.entity.Room;
import com.travelzone.hotel.repository.ReservationRepository;
import com.travelzone.hotel.repository.RoomRepository;
import com.travelzone.user.entity.User;
import com.travelzone.user.repository.UserRepository;
import org.springframework.stereotype.Service;

@Service
public class RoomService {

    private final RoomRepository roomRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;

    public RoomService(RoomRepository roomRepository,
                       ReservationRepository reservationRepository,
                       UserRepository userRepository) {
        this.roomRepository = roomRepository;
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
    }

    public RoomResponse updateRoomAvailability(Long roomId, UpdateRoomAvailabilityRequest request, String requesterEmail) {
        User owner = userRepository.findByEmailAndDeletedFalse(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Room room = roomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        if (!room.getHotel().getOwner().getId().equals(owner.getId())) {
            throw new UnauthorizedException("Only the hotel owner can update this room");
        }

        boolean hasActiveReservation = reservationRepository.findAll().stream()
                .map(Reservation.class::cast)
                .anyMatch(r -> r.getRoom().getId().equals(roomId));

        if (Boolean.TRUE.equals(request.getAvailable()) && hasActiveReservation && request.getAvailableCount() <= 0) {
            throw new BadRequestException("Cannot mark room available if already booked");
        }

        room.setAvailable(request.getAvailable());
        room.setRoomCount(request.getRoomCount());
        room.setAvailableCount(request.getAvailableCount());
        room.setPricePerNight(request.getPricePerNight());

        Room updated = roomRepository.save(room);

        return new RoomResponse(
                updated.getId(),
                updated.getRoomType(),
                updated.getRoomCount(),
                updated.getAvailableCount(),
                updated.getPricePerNight(),
                updated.isAvailable()
        );
    }
}
