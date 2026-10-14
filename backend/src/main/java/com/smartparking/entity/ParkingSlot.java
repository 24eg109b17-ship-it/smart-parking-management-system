package com.smartparking.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ParkingSlot Entity - Represents individual parking spots inside a Parking Area.
 *
 * Each ParkingSlot belongs to a ParkingArea.
 * Status tracks whether the slot is currently AVAILABLE, RESERVED, or OCCUPIED.
 *
 * Status Lifecycle:
 *   AVAILABLE → (user reserves) → RESERVED → (vehicle enters) → OCCUPIED → (vehicle exits) → AVAILABLE
 *
 * @ManyToOne: Many parking slots belong to ONE parking area
 * @JoinColumn: Creates 'parking_area_id' foreign key column in parking_slots table
 */
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "parking_slots")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParkingSlot {

    // Auto-generated primary key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Version
    @JsonIgnore
    private Long version;

    // The slot label displayed to users (e.g., "A01", "A02", "B01")
    @Column(nullable = false)
    @jakarta.validation.constraints.NotBlank
    @jakarta.validation.constraints.Size(max = 20)
    private String slotNumber;

    // Type of slot: "CAR", "BIKE", "TRUCK"
    // Matches vehicle types so users park in appropriate spots
    @Column(nullable = false)
    @jakarta.validation.constraints.Pattern(regexp = "CAR|BIKE|TRUCK")
    @jakarta.validation.constraints.NotBlank
    private String slotType;

    // Current status of this slot
    // Possible values: "AVAILABLE", "RESERVED", "OCCUPIED"
    // This is the most important field - it controls the parking workflow
    @Column(nullable = false)
    private String status;

    // The parking area this slot belongs to
    // @ManyToOne: Many slots → One parking area
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parking_area_id", nullable = false)
    private ParkingArea parkingArea;
}
