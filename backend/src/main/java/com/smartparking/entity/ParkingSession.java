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
 * ParkingSession Entity - Records an active or completed parking session.
 *
 * When vehicle ENTERS the parking area:
 *  1. A ParkingSession is created with entryTime set
 *  2. ParkingSlot status changes from RESERVED → OCCUPIED
 *  3. Session status = "ACTIVE"
 *
 * When vehicle EXITS:
 *  1. exitTime is recorded
 *  2. Duration is calculated (exitTime - entryTime)
 *  3. Fee is calculated (duration × pricePerHour)
 *  4. ParkingSlot status changes from OCCUPIED → AVAILABLE
 *  5. Session status = "COMPLETED"
 *
 * This is the most important entity for the fee calculation feature.
 */
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "parking_sessions")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParkingSession {

    // Auto-generated primary key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    @JsonIgnore
    private Long version;

    // The user whose vehicle is parked
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // The vehicle that is parked
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vehicle_id", nullable = false)
    private Vehicle vehicle;

    // The parking slot being used
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parking_slot_id", nullable = false)
    private ParkingSlot parkingSlot;

    // When the vehicle entered the parking area
    @Column(nullable = false)
    @JsonFormat(pattern = "yyyy-MM-dd\u0027T\u0027HH:mm:ss.SSS\u0027Z\u0027")
    private LocalDateTime entryTime;

    // When the vehicle exited (null while session is active)
    @JsonFormat(pattern = "yyyy-MM-dd\u0027T\u0027HH:mm:ss.SSS\u0027Z\u0027")
    private LocalDateTime exitTime;

    // Duration in minutes (calculated on exit)
    private Long durationMinutes;

    // Total fee charged (calculated on exit)
    private Double totalAmount;

    // Snapshot the rate at entry so later area edits cannot change an active bill.
    private Double pricePerHour;

    // Session status: "ACTIVE" while parked, "COMPLETED" after exit
    @Column(nullable = false)
    private String status;
}
