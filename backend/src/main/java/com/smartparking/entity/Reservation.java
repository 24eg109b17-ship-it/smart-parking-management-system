package com.smartparking.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Reservation Entity - Records when a user reserves a parking slot.
 *
 * When a user clicks "Reserve" on an available slot:
 *  1. A Reservation record is created in this table
 *  2. The ParkingSlot status changes from AVAILABLE → RESERVED
 *
 * Reservation status:
 *  "ACTIVE"    - Slot is currently reserved
 *  "COMPLETED" - Vehicle has entered, parking session started
 *  "CANCELLED" - User cancelled the reservation
 *
 * This table has relationships with:
 *  - User (who made the reservation)
 *  - Vehicle (which vehicle is being parked)
 *  - ParkingSlot (which slot is reserved)
 */
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "reservations")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reservation {

    // Auto-generated primary key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    @JsonIgnore
    private Long version;

    // The user who made this reservation
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // The vehicle for which this reservation is made
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    // The parking slot that is being reserved
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parking_slot_id", nullable = false)
    private ParkingSlot parkingSlot;

    // When the reservation was created (automatically set)
    @Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd\u0027T\u0027HH:mm:ss.SSS\u0027Z\u0027")
    private LocalDateTime reservationTime;

    // Current status: "ACTIVE", "COMPLETED", or "CANCELLED"
    @Column(nullable = false)
    private String status;

    // Set current time when reservation is created
    @PrePersist
    public void prePersist() {
        this.reservationTime = LocalDateTime.now(java.time.Clock.systemUTC());
    }
}
