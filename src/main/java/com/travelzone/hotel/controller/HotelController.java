package com.travelzone.hotel.controller;

import com.travelzone.hotel.dto.CreateHotelRequest;
import com.travelzone.hotel.dto.HotelDetailResponse;
import com.travelzone.hotel.dto.HotelSearchResponse;
import com.travelzone.hotel.service.HotelService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/hotels")
public class HotelController {

    private final HotelService hotelService;

    public HotelController(HotelService hotelService) {
        this.hotelService = hotelService;
    }

    @PostMapping
    public ResponseEntity<HotelDetailResponse> createHotel(@Valid @RequestBody CreateHotelRequest request,
                                                           Authentication authentication) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(hotelService.createHotel(request, authentication.getName()));
    }

    @GetMapping
    public ResponseEntity<Page<HotelSearchResponse>> searchHotels(
            @RequestParam(required = false) String location,
            @RequestParam(required = false) BigDecimal price,
            @RequestParam(required = false) String facilities,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(hotelService.searchHotels(location, price, facilities, page, size));
    }

    @GetMapping("/{hotelId}")
    public ResponseEntity<HotelDetailResponse> getHotelDetails(@PathVariable Long hotelId) {
        return ResponseEntity.ok(hotelService.getHotelDetails(hotelId));
    }
}
