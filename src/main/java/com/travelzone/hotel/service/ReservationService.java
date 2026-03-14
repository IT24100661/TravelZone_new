package com.travelzone.hotel.service;

import com.travelzone.common.enums.BookingStatus;
import com.travelzone.common.enums.Role;
import com.travelzone.exception.BadRequestException;
import com.travelzone.exception.ResourceNotFoundException;
import com.travelzone.exception.UnauthorizedException;
import com.travelzone.hotel.dto.CreateReservationRequest;
import com.travelzone.hotel.dto.ReservationResponse;
import com.travelzone.hotel.entity.Hotel;
import com.travelzone.hotel.entity.Reservation;
import com.travelzone.hotel.entity.Room;
import com.travelzone.hotel.repository.HotelRepository;
import com.travelzone.hotel.repository.ReservationRepository;
import com.travelzone.hotel.repository.RoomRepository;
import com.travelzone.notification.service.NotificationService;
import com.travelzone.user.entity.User;
import com.travelzone.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.temporal.ChronoUnit;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final HotelRepository hotelRepository;
    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    public ReservationService(ReservationRepository reservationRepository,
                              HotelRepository hotelRepository,
                              RoomRepository roomRepository,
                              UserRepository userRepository,
                              NotificationService notificationService) {
        this.reservationRepository = reservationRepository;
        this.hotelRepository = hotelRepository;
        this.roomRepository = roomRepository;
        this.userRepository = userRepository;
        this.notificationService = notificationService;
    }

    public ReservationResponse createReservation(CreateReservationRequest request, String requesterEmail) {
        User tourist = userRepository.findByEmailAndDeletedFalse(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Tourist not found"));

        if (tourist.getRole() != Role.TOURIST) {
            throw new UnauthorizedException("Only tourists can make reservations");
        }

        Hotel hotel = hotelRepository.findById(request.getHotelId())
                .orElseThrow(() -> new ResourceNotFoundException("Hotel not found"));

        Room room = roomRepository.findById(request.getRoomId())
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));

        if (!room.getHotel().getId().equals(hotel.getId())) {
            throw new BadRequestException("Room does not belong to selected hotel");
        }

        if (!room.isAvailable() || room.getAvailableCount() <= 0) {
            throw new BadRequestException("Room is not available");
        }

        long nights = ChronoUnit.DAYS.between(request.getCheckIn(), request.getCheckOut());
        if (nights <= 0) {
            throw new BadRequestException("Check-out must be after check-in");
        }

        BigDecimal totalPrice = room.getPricePerNight().multiply(BigDecimal.valueOf(nights));

        Reservation reservation = new Reservation();
        reservation.setHotel(hotel);
        reservation.setRoom(room);
        reservation.setTourist(tourist);
        reservation.setCheckIn(request.getCheckIn());
        reservation.setCheckOut(request.getCheckOut());
        reservation.setTotalPrice(totalPrice);
        reservation.setStatus(BookingStatus.PENDING);

        Reservation saved = reservationRepository.save(reservation);

        room.setAvailableCount(room.getAvailableCount() - 1);
        if (room.getAvailableCount() <= 0) {
            room.setAvailable(false);
        }
        roomRepository.save(room);

        return map(saved);
    }

    public String cancelReservation(Long reservationId, String requesterEmail) {
        User tourist = userRepository.findByEmailAndDeletedFalse(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Tourist not found"));

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

        if (!reservation.getTourist().getId().equals(tourist.getId())) {
            throw new UnauthorizedException("Only the tourist can cancel this reservation");
        }

        long hoursUntilCheckIn = java.time.LocalDateTime.now()
                .until(reservation.getCheckIn().atStartOfDay(), java.time.temporal.ChronoUnit.HOURS);

        if (hoursUntilCheckIn < 48) {
            throw new BadRequestException("Cancellation allowed only 48 hours before check-in");
        }

        reservation.setStatus(BookingStatus.CANCELLED);
        reservationRepository.save(reservation);

        Room room = reservation.getRoom();
        room.setAvailableCount(room.getAvailableCount() + 1);
        room.setAvailable(true);
        roomRepository.save(room);

        notificationService.notifyUser(
                tourist.getEmail(),
                "Your reservation has been cancelled. Refund will follow hotel cancellation policy."
        );

        return "Reservation cancelled successfully";
    }

    private ReservationResponse map(Reservation reservation) {
        return new ReservationResponse(
                reservation.getId(),
                reservation.getHotel().getId(),
                reservation.getRoom().getId(),
                reservation.getTourist().getId(),
                reservation.getCheckIn(),
                reservation.getCheckOut(),
                reservation.getTotalPrice(),
                reservation.getStatus()
        );
    }
}
