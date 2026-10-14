package com.smartparking.entity;

import jakarta.persistence.*;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Vehicle Entity - Represents the 'vehicles' table in MySQL.
 *
 * Each Vehicle belongs to a User (Many vehicles can belong to one user).
 * This is called a Many-to-One relationship.
 *
 * @ManyToOne - Many vehicles can belong to ONE user
 * @JoinColumn - Specifies the foreign key column name in the vehicles table
 *               This creates a column 'user_id' in the vehicles table
 *               that references the 'id' column in the users table.
 */
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
@Entity
@Table(name = "vehicles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vehicle {

    // Auto-generated primary key
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Vehicle registration number (e.g., "TS09AB1234")
    // Should be unique to avoid duplicate registrations
    @Column(nullable = false, unique = true)
    private String vehicleNumber;

    // Type of vehicle: "CAR", "BIKE", "TRUCK"
    @Column(nullable = false)
    private String vehicleType;

    // Vehicle model name (e.g., "Honda City", "Royal Enfield")
    private String model;

    // The user who owns this vehicle
    // @ManyToOne: Many vehicles → One user
    // @JoinColumn: Creates 'user_id' foreign key column in vehicles table
    // fetch = LAZY means user data is loaded only when accessed (better performance)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
