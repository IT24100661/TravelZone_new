package com.travelzone.hotel.controller;

import com.travelzone.common.dto.ApiResponse;
import com.travelzone.hotel.dto.CreateReservationRequest;
import com.travelzone.hotel.dto.ReservationResponse;
import com.travelzone.hotel.service.ReservationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @PostMapping
    public ResponseEntity<ReservationResponse> createReservation(@Valid @RequestBody CreateReservationRequest request,
                                                                 Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(reservationService.createReservation(request, authentication.getName()));
    }

    @DeleteMapping("/{reservationId}")
    public ResponseEntity<ApiResponse> cancelReservation(@PathVariable Long reservationId,
                                                         Authentication authentication) {
        return ResponseEntity.ok(new ApiResponse(true,
                reservationService.cancelReservation(reservationId, authentication.getName())));
    }
}
