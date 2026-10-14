package com.smartparking.controller;

import com.smartparking.dto.ReservationRequest;
import com.smartparking.entity.Reservation;
import com.smartparking.service.ReservationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ReservationController - Handles parking slot reservation HTTP requests.
 *
 * Endpoints:
 * POST /api/reservations                    → Create a new reservation
 * GET  /api/reservations/user/{userId}      → Get reservations for a user
 * GET  /api/reservations                    → Get all reservations (Admin)
 * PUT  /api/reservations/{id}/cancel        → Cancel a reservation
 */
@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    @Autowired
    private ReservationService reservationService;

    /**
     * POST /api/reservations
     * Create a new reservation.
     *
     * Request body: { "userId": 1, "vehicleId": 2, "parkingSlotId": 5 }
     * Response: The created Reservation object with all details
     *
     * This changes the slot status from AVAILABLE → RESERVED
     */
    @PostMapping
    public ResponseEntity<Reservation> createReservation(@jakarta.validation.Valid @RequestBody ReservationRequest request) {
        Reservation reservation = reservationService.createReservation(request);
        return ResponseEntity.ok(reservation);
    }

    /**
     * GET /api/reservations/user/{userId}
     * Get all reservations made by a specific user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Reservation>> getReservationsByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reservationService.getReservationsByUser(userId));
    }

    /**
     * GET /api/reservations
     * Get all reservations in the system (Admin view).
     */
    @GetMapping
    public ResponseEntity<List<Reservation>> getAllReservations() {
        return ResponseEntity.ok(reservationService.getAllReservations());
    }

    /**
     * PUT /api/reservations/{id}/cancel
     * Cancel an active reservation.
     *
     * This changes the slot status from RESERVED → AVAILABLE
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<Reservation> cancelReservation(@PathVariable Long id) {
        Reservation cancelled = reservationService.cancelReservation(id);
        return ResponseEntity.ok(cancelled);
    }
}
