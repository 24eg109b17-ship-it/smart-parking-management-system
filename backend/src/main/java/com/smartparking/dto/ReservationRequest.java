package com.smartparking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ReservationRequest DTO - Data sent when a user wants to reserve a parking slot.
 *
 * The frontend sends:
 * - userId: who is making the reservation
 * - vehicleId: which vehicle will be parked
 * - parkingSlotId: which slot to reserve
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRequest {

    // ID of the user making the reservation
    @jakarta.validation.constraints.NotNull
    @jakarta.validation.constraints.Positive
    private Long userId;

    // ID of the vehicle to be parked
    @jakarta.validation.constraints.NotNull
    @jakarta.validation.constraints.Positive
    private Long vehicleId;

    // ID of the parking slot to reserve
    @jakarta.validation.constraints.NotNull
    @jakarta.validation.constraints.Positive
    private Long parkingSlotId;
}
