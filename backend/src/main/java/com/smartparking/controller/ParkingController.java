package com.smartparking.controller;

import com.smartparking.dto.ParkingEntryRequest;
import com.smartparking.entity.ParkingSession;
import com.smartparking.service.ParkingSessionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

/**
 * ParkingController - Handles vehicle entry, exit, and parking history HTTP requests.
 *
 * This is the most important controller for the demo workflow:
 *
 * Endpoints:
 * POST /api/parking/entry              → Record vehicle entry (RESERVED → OCCUPIED)
 * POST /api/parking/exit/{sessionId}   → Record vehicle exit + calculate fee (OCCUPIED → AVAILABLE)
 * GET  /api/parking/active/{userId}    → Get current active session for a user
 * GET  /api/parking/history/{userId}   → Get parking history for a user
 * GET  /api/parking/sessions/active    → Get all active sessions (Admin)
 * GET  /api/parking/sessions/completed → Get all completed sessions (Admin)
 */
@RestController
@RequestMapping("/api/parking")
public class ParkingController {

    @Autowired
    private ParkingSessionService parkingSessionService;

    /**
     * POST /api/parking/entry
     * Record vehicle entry into the parking area.
     *
     * What this does:
     * 1. Validates the slot is RESERVED
     * 2. Creates a new ParkingSession (entryTime = now)
     * 3. Changes slot status: RESERVED → OCCUPIED
     * 4. Marks the reservation as COMPLETED
     *
     * Request body: { "userId": 1, "vehicleId": 2, "parkingSlotId": 5, "reservationId": 3 }
     */
    @PostMapping("/entry")
    public ResponseEntity<ParkingSession> recordEntry(@jakarta.validation.Valid @RequestBody ParkingEntryRequest request) {
        ParkingSession session = parkingSessionService.recordEntry(request);
        return ResponseEntity.ok(session);
    }

    /**
     * POST /api/parking/exit/{sessionId}
     * Record vehicle exit and calculate the parking fee.
     *
     * What this does:
     * 1. Finds the active session
     * 2. Records exitTime = now
     * 3. Calculates duration (exitTime - entryTime)
     * 4. Calculates fee (rounded up hours × price per hour)
     * 5. Marks session as COMPLETED
     * 6. Changes slot status: OCCUPIED → AVAILABLE
     *
     * @PathVariable Long sessionId - The ID of the active parking session
     */
    @PostMapping("/exit/{sessionId}")
    public ResponseEntity<ParkingSession> recordExit(@PathVariable Long sessionId) {
        ParkingSession completedSession = parkingSessionService.recordExit(sessionId);
        return ResponseEntity.ok(completedSession);
    }

    /**
     * GET /api/parking/active/{userId}
     * Get the current active parking session for a user.
     *
     * Returns the session if one exists, or a 404 response if no active session.
     * Used to show the "Active Session" card on the user dashboard.
     */
    @GetMapping("/active/{userId}")
    public ResponseEntity<?> getActiveSession(@PathVariable Long userId) {
        Optional<ParkingSession> session = parkingSessionService.getActiveSession(userId);

        if (session.isPresent()) {
            return ResponseEntity.ok(session.get());
        } else {
            // Return 404 with a friendly message
            return ResponseEntity.status(404).body("No active parking session found.");
        }
    }

    /**
     * GET /api/parking/history/{userId}
     * Get all completed parking sessions for a user.
     *
     * Used for the "Parking History" page - shows all previous sessions,
     * duration, and fees paid.
     */
    @GetMapping("/history/{userId}")
    public ResponseEntity<List<ParkingSession>> getParkingHistory(@PathVariable Long userId) {
        return ResponseEntity.ok(parkingSessionService.getParkingHistory(userId));
    }

    /**
     * GET /api/parking/sessions/active
     * Get all currently active parking sessions (Admin Dashboard).
     */
    @GetMapping("/sessions/active")
    public ResponseEntity<List<ParkingSession>> getAllActiveSessions() {
        return ResponseEntity.ok(parkingSessionService.getAllActiveSessions());
    }

    /**
     * GET /api/parking/sessions/completed
     * Get all completed parking sessions (Admin Dashboard).
     */
    @GetMapping("/sessions/completed")
    public ResponseEntity<List<ParkingSession>> getAllCompletedSessions() {
        return ResponseEntity.ok(parkingSessionService.getAllCompletedSessions());
    }

    /**
     * GET /api/parking/session/{sessionId}
     * Get a specific session by ID.
     */
    @GetMapping("/session/{sessionId}")
    public ResponseEntity<ParkingSession> getSessionById(@PathVariable Long sessionId) {
        return ResponseEntity.ok(parkingSessionService.getSessionById(sessionId));
    }
}
