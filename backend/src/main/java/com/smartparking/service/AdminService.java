package com.smartparking.service;

import com.smartparking.dto.DashboardStats;
import com.smartparking.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * AdminService - Collects statistics for the Admin Dashboard.
 *
 * This service gathers data from ALL repositories to create a
 * comprehensive summary of the parking system's state.
 *
 * All the numbers shown on the Admin Dashboard come from this service.
 */
@Service
public class AdminService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private VehicleRepository vehicleRepository;

    @Autowired
    private ParkingAreaRepository parkingAreaRepository;

    @Autowired
    private ParkingSlotRepository parkingSlotRepository;

    @Autowired
    private ReservationRepository reservationRepository;

    @Autowired
    private ParkingSessionRepository parkingSessionRepository;

    /**
     * Calculate and return all dashboard statistics.
     *
     * This is called when the admin opens the dashboard.
     * It queries the database for current counts and totals.
     *
     * @return DashboardStats containing all statistics for the admin dashboard
     */
    public DashboardStats getDashboardStats() {
        // Create the stats object to fill in
        DashboardStats stats = new DashboardStats();

        // Count total users registered in the system
        stats.setTotalUsers(userRepository.count());

        // Count total vehicles registered
        stats.setTotalVehicles(vehicleRepository.count());

        // Count total parking areas
        stats.setTotalParkingAreas(parkingAreaRepository.count());

        // Count slots by status
        stats.setTotalSlots(parkingSlotRepository.count());
        stats.setAvailableSlots(parkingSlotRepository.countByStatus("AVAILABLE"));
        stats.setReservedSlots(parkingSlotRepository.countByStatus("RESERVED"));
        stats.setOccupiedSlots(parkingSlotRepository.countByStatus("OCCUPIED"));

        // Count active parking sessions (vehicles currently parked)
        stats.setActiveSessions(parkingSessionRepository.countByStatus("ACTIVE"));

        // Count all reservations ever made
        stats.setTotalReservations(reservationRepository.count());

        // Count completed parking sessions
        stats.setCompletedSessions(parkingSessionRepository.countByStatus("COMPLETED"));

        // Calculate total revenue from all completed sessions
        // This uses the @Query in the repository to SUM all totalAmount values
        Double revenue = parkingSessionRepository.calculateTotalRevenue();
        stats.setTotalRevenue(revenue != null ? revenue : 0.0);

        return stats;
    }
}
