package com.smartparking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DashboardStats DTO - Statistics for the Admin Dashboard.
 *
 * This DTO carries all the summary numbers shown in the Admin Dashboard:
 * - How many users are registered
 * - How many parking slots are available/reserved/occupied
 * - Total revenue earned
 * etc.
 *
 * The AdminService collects all these numbers from different repositories
 * and puts them into this one object to send to the frontend.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStats {

    // User statistics
    private long totalUsers;

    // Vehicle statistics
    private long totalVehicles;

    // Parking area statistics
    private long totalParkingAreas;

    // Slot statistics
    private long totalSlots;
    private long availableSlots;
    private long reservedSlots;
    private long occupiedSlots;

    // Session statistics
    private long activeSessions;
    private long totalReservations;
    private long completedSessions;

    // Revenue
    private double totalRevenue;
}
