package com.travelzone.hotel.controller;

import com.travelzone.hotel.dto.RoomResponse;
import com.travelzone.hotel.dto.UpdateRoomAvailabilityRequest;
import com.travelzone.hotel.service.RoomService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/rooms")
public class RoomController {

    private final RoomService roomService;

    public RoomController(RoomService roomService) {
        this.roomService = roomService;
    }

    @PutMapping("/{roomId}/availability")
    public ResponseEntity<RoomResponse> updateRoomAvailability(@PathVariable Long roomId,
                                                               @Valid @RequestBody UpdateRoomAvailabilityRequest request,
                                                               Authentication authentication) {
        return ResponseEntity.ok(roomService.updateRoomAvailability(roomId, request, authentication.getName()));
    }
}
