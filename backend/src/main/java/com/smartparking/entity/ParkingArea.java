package com.smartparking.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * ParkingArea Entity - Represents the 'parking_areas' table in MySQL.
 *
 * A Parking Area is like "Anurag University Main Parking" - a physical location
 * that contains multiple parking slots.
 *
 * One ParkingArea has many ParkingSlots (One-to-Many relationship).
 * But the ParkingSlot side manages this relationship (using @ManyToOne in ParkingSlot).
 */
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "parking_areas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ParkingArea {

    // Auto-generated primary key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Name of the parking area (e.g., "Anurag University Main Parking")
    @Column(nullable = false)
    @jakarta.validation.constraints.NotBlank
    @jakarta.validation.constraints.Size(max = 120)
    private String name;

    // Physical location description (e.g., "Main Block, Gate 1")
    @Column(nullable = false)
    @jakarta.validation.constraints.NotBlank
    @jakarta.validation.constraints.Size(max = 200)
    private String location;

    // Total number of parking slots in this area
    @Column(nullable = false)
    @jakarta.validation.constraints.Min(1)
    @jakarta.validation.constraints.Max(500)
    private int totalSlots;

    // Price charged per hour for parking (in Rupees)
    // Example: 20.0 means ₹20 per hour
    @Column(nullable = false)
    @jakarta.validation.constraints.DecimalMin("0.0")
    @jakarta.validation.constraints.DecimalMax("10000.0")
    private double pricePerHour;

    // Description/additional info about this parking area
    private String description;
}
