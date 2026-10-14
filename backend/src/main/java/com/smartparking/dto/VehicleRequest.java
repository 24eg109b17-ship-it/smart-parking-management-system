package com.smartparking.dto;

import lombok.Data;

/**
 * VehicleRequest DTO - Data sent when adding or updating a vehicle.
 */
@Data
public class VehicleRequest {

    // Vehicle registration number (e.g., "TS09AB1234")
    @jakarta.validation.constraints.NotBlank
    @jakarta.validation.constraints.Pattern(regexp = "[a-zA-Z0-9 -]{4,20}")
    private String vehicleNumber;

    // Type: "CAR", "BIKE", or "TRUCK"
    @jakarta.validation.constraints.NotBlank
    @jakarta.validation.constraints.Pattern(regexp = "CAR|BIKE|TRUCK")
    private String vehicleType;

    // Model name (e.g., "Honda City")
    @jakarta.validation.constraints.Size(max = 100)
    private String model;

    // ID of the user who owns this vehicle (passed from frontend's localStorage)
    @jakarta.validation.constraints.NotNull
    @jakarta.validation.constraints.Positive
    private Long userId;
}
