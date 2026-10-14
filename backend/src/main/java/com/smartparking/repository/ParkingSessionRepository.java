package com.smartparking.repository;

import com.smartparking.entity.ParkingSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ParkingSessionRepository - Handles database operations for ParkingSession entity.
 *
 * This repository is crucial for the core parking workflow:
 * - Finding active sessions (vehicle currently parked)
 * - Retrieving parking history (completed sessions)
 * - Calculating revenue (sum of amounts)
 */
@Repository
public interface ParkingSessionRepository extends JpaRepository<ParkingSession, Long> {

    /**
     * Find an active parking session for a specific user.
     * A user can only have ONE active session at a time.
     * Spring generates: SELECT * FROM parking_sessions WHERE user_id = ? AND status = ?
     */
    Optional<ParkingSession> findByUserIdAndStatus(Long userId, String status);

    /**
     * Get all parking sessions for a specific user (their complete parking history).
     * Spring generates: SELECT * FROM parking_sessions WHERE user_id = ? ORDER BY entry_time DESC
     */
    List<ParkingSession> findByUserIdOrderByEntryTimeDesc(Long userId);

    /**
     * Get all active sessions (Admin Dashboard - who is currently parked).
     * Spring generates: SELECT * FROM parking_sessions WHERE status = ?
     */
    List<ParkingSession> findByStatus(String status);

    /**
     * Count sessions by status (for Admin Dashboard statistics).
     */
    long countByStatus(String status);

    /**
     * Calculate total revenue from all completed parking sessions.
     *
     * @Query allows us to write custom JPQL (Java Persistence Query Language).
     * JPQL uses entity/field names, not table/column names.
     * SUM(ps.totalAmount) adds up all fee amounts from completed sessions.
     *
     * The COALESCE handles the case when there are no completed sessions (returns 0).
     */
    @Query("SELECT COALESCE(SUM(ps.totalAmount), 0) FROM ParkingSession ps WHERE ps.status = 'COMPLETED'")
    Double calculateTotalRevenue();

    /**
     * Find active session for a specific parking slot.
     * Used during vehicle exit to find which session to complete.
     */
    Optional<ParkingSession> findByParkingSlotIdAndStatus(Long slotId, String status);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select s from ParkingSession s where s.id = :id")
    Optional<ParkingSession> findLockedById(@org.springframework.data.repository.query.Param("id") Long id);

    boolean existsByUserIdAndStatus(Long userId, String status);
    boolean existsByVehicleId(Long vehicleId);
    boolean existsByParkingSlotId(Long slotId);
    List<ParkingSession> findByUserIdAndStatusOrderByEntryTimeDesc(Long userId, String status);
}
