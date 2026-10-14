package com.smartparking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ParkingEntryRequest DTO - Data sent when a vehicle enters the parking area.
 *
 * This triggers:
 * 1. Creation of a new ParkingSession with entryTime = now()
 * 2. Reservation status changes from ACTIVE → COMPLETED
 * 3. ParkingSlot status changes from RESERVED → OCCUPIED
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParkingEntryRequest {

    // ID of the user whose vehicle is entering
    @jakarta.validation.constraints.NotNull
    @jakarta.validation.constraints.Positive
    private Long userId;

    // ID of the vehicle entering
    @jakarta.validation.constraints.NotNull
    @jakarta.validation.constraints.Positive
    private Long vehicleId;

    // ID of the parking slot (must currently be RESERVED)
    @jakarta.validation.constraints.NotNull
    @jakarta.validation.constraints.Positive
    private Long parkingSlotId;

    // ID of the reservation (to mark it as completed)
    @jakarta.validation.constraints.NotNull
    @jakarta.validation.constraints.Positive
    private Long reservationId;
}
