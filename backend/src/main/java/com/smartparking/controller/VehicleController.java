package com.smartparking.controller;

import com.smartparking.dto.VehicleRequest;
import com.smartparking.entity.Vehicle;
import com.smartparking.service.VehicleService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * VehicleController - Handles vehicle management HTTP requests.
 *
 * REST Endpoints:
 * GET    /api/vehicles              → Get all vehicles (Admin)
 * GET    /api/vehicles/user/{userId} → Get vehicles for a specific user
 * POST   /api/vehicles              → Add a new vehicle
 * PUT    /api/vehicles/{id}         → Update a vehicle
 * DELETE /api/vehicles/{id}         → Delete a vehicle
 */
@RestController
@RequestMapping("/api/vehicles")
public class VehicleController {

    @Autowired
    private VehicleService vehicleService;

    /**
     * GET /api/vehicles
     * Get all vehicles in the system (Admin use).
     */
    @GetMapping
    public ResponseEntity<List<Vehicle>> getAllVehicles() {
        return ResponseEntity.ok(vehicleService.getAllVehicles());
    }

    /**
     * GET /api/vehicles/user/{userId}
     * Get all vehicles for a specific user (My Vehicles page).
     *
     * @PathVariable - Extracts the value from the URL path
     * Example: GET /api/vehicles/user/3 → userId = 3
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Vehicle>> getVehiclesByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(vehicleService.getVehiclesByUserId(userId));
    }

    /**
     * POST /api/vehicles
     * Add a new vehicle.
     *
     * Request body: { "vehicleNumber": "TS09AB1234", "vehicleType": "CAR", "model": "Honda City", "userId": 1 }
     */
    @PostMapping
    public ResponseEntity<Vehicle> addVehicle(@jakarta.validation.Valid @RequestBody VehicleRequest request) {
        Vehicle vehicle = vehicleService.addVehicle(request);
        return ResponseEntity.ok(vehicle);
    }

    /**
     * PUT /api/vehicles/{id}
     * Update an existing vehicle.
     *
     * @PathVariable Long id - Vehicle ID from URL
     * @jakarta.validation.Valid @RequestBody VehicleRequest - Updated vehicle data
     */
    @PutMapping("/{id}")
    public ResponseEntity<Vehicle> updateVehicle(@PathVariable Long id, @jakarta.validation.Valid @RequestBody VehicleRequest request) {
        Vehicle updatedVehicle = vehicleService.updateVehicle(id, request);
        return ResponseEntity.ok(updatedVehicle);
    }

    /**
     * DELETE /api/vehicles/{id}
     * Delete a vehicle by ID.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<String> deleteVehicle(@PathVariable Long id) {
        vehicleService.deleteVehicle(id);
        return ResponseEntity.ok("Vehicle deleted successfully.");
    }
}
