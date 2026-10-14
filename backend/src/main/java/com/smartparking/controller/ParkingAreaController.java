package com.smartparking.controller;

import com.smartparking.entity.ParkingArea;
import com.smartparking.entity.ParkingSlot;
import com.smartparking.service.ParkingAreaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ParkingAreaController - Handles parking area and parking slot HTTP requests.
 *
 * Parking Area Endpoints:
 * GET    /api/parking-areas           → Get all parking areas
 * GET    /api/parking-areas/{id}      → Get a specific parking area
 * POST   /api/parking-areas           → Add a parking area (Admin)
 * PUT    /api/parking-areas/{id}      → Update a parking area (Admin)
 * DELETE /api/parking-areas/{id}      → Delete a parking area (Admin)
 *
 * Parking Slot Endpoints:
 * GET    /api/parking-slots/area/{areaId}      → All slots in an area
 * GET    /api/parking-slots/available/{areaId} → Available slots in an area
 * POST   /api/parking-slots/area/{areaId}      → Add a slot to an area (Admin)
 * PUT    /api/parking-slots/{slotId}           → Update a slot (Admin)
 * DELETE /api/parking-slots/{slotId}           → Delete a slot (Admin)
 */
@RestController
public class ParkingAreaController {

    @Autowired
    private ParkingAreaService parkingAreaService;

    // ===== PARKING AREA ENDPOINTS =====

    @GetMapping("/api/parking-areas")
    public ResponseEntity<List<ParkingArea>> getAllParkingAreas() {
        return ResponseEntity.ok(parkingAreaService.getAllParkingAreas());
    }

    @GetMapping("/api/parking-areas/{id}")
    public ResponseEntity<ParkingArea> getParkingAreaById(@PathVariable Long id) {
        return ResponseEntity.ok(parkingAreaService.getParkingAreaById(id));
    }

    @PostMapping("/api/parking-areas")
    public ResponseEntity<ParkingArea> addParkingArea(@jakarta.validation.Valid @RequestBody ParkingArea parkingArea) {
        return ResponseEntity.ok(parkingAreaService.addParkingArea(parkingArea));
    }

    @PutMapping("/api/parking-areas/{id}")
    public ResponseEntity<ParkingArea> updateParkingArea(@PathVariable Long id, @jakarta.validation.Valid @RequestBody ParkingArea parkingArea) {
        return ResponseEntity.ok(parkingAreaService.updateParkingArea(id, parkingArea));
    }

    @DeleteMapping("/api/parking-areas/{id}")
    public ResponseEntity<String> deleteParkingArea(@PathVariable Long id) {
        parkingAreaService.deleteParkingArea(id);
        return ResponseEntity.ok("Parking area deleted successfully.");
    }

    // ===== PARKING SLOT ENDPOINTS =====

    /**
     * GET /api/parking-slots
     * Get ALL parking slots across all areas (Admin view).
     */
    @GetMapping("/api/parking-slots")
    public ResponseEntity<List<ParkingSlot>> getAllSlots() {
        return ResponseEntity.ok(parkingAreaService.getAllSlots());
    }

    /**
     * GET /api/parking-slots/area/{areaId}
     * Get all parking slots for a specific area.
     * Used to render the visual slot grid on the frontend.
     */
    @GetMapping("/api/parking-slots/area/{areaId}")
    public ResponseEntity<List<ParkingSlot>> getSlotsByArea(@PathVariable Long areaId) {
        return ResponseEntity.ok(parkingAreaService.getSlotsByArea(areaId));
    }

    /**
     * GET /api/parking-slots/available/{areaId}
     * Get only AVAILABLE slots in a specific area.
     */
    @GetMapping("/api/parking-slots/available/{areaId}")
    public ResponseEntity<List<ParkingSlot>> getAvailableSlots(@PathVariable Long areaId) {
        return ResponseEntity.ok(parkingAreaService.getAvailableSlots(areaId));
    }

    /**
     * POST /api/parking-slots/area/{areaId}
     * Add a new slot to a parking area (Admin).
     */
    @PostMapping("/api/parking-slots/area/{areaId}")
    public ResponseEntity<ParkingSlot> addParkingSlot(@PathVariable Long areaId, @jakarta.validation.Valid @RequestBody ParkingSlot slot) {
        return ResponseEntity.ok(parkingAreaService.addParkingSlot(areaId, slot));
    }

    /**
     * PUT /api/parking-slots/{slotId}
     * Update a parking slot (Admin).
     */
    @PutMapping("/api/parking-slots/{slotId}")
    public ResponseEntity<ParkingSlot> updateParkingSlot(@PathVariable Long slotId, @jakarta.validation.Valid @RequestBody ParkingSlot slot) {
        return ResponseEntity.ok(parkingAreaService.updateParkingSlot(slotId, slot));
    }

    /**
     * DELETE /api/parking-slots/{slotId}
     * Delete a parking slot (Admin).
     */
    @DeleteMapping("/api/parking-slots/{slotId}")
    public ResponseEntity<String> deleteParkingSlot(@PathVariable Long slotId) {
        parkingAreaService.deleteParkingSlot(slotId);
        return ResponseEntity.ok("Parking slot deleted successfully.");
    }
}
