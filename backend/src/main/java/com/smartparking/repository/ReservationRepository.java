package com.smartparking.repository;

import com.smartparking.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * ReservationRepository - Handles database operations for Reservation entity.
 */
@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    /**
     * Get all reservations made by a specific user.
     * Spring generates: SELECT * FROM reservations WHERE user_id = ?
     */
    List<Reservation> findByUserId(Long userId);

    /**
     * Get all active reservations for a specific parking slot.
     * Used to check if a slot is already reserved before allowing another reservation.
     * Spring generates: SELECT * FROM reservations WHERE parking_slot_id = ? AND status = ?
     */
    Optional<Reservation> findByParkingSlotIdAndStatus(Long slotId, String status);

    /**
     * Get all reservations with a specific status (for Admin view).
     * Spring generates: SELECT * FROM reservations WHERE status = ?
     */
    List<Reservation> findByStatus(String status);

    /**
     * Count total reservations (for Admin Dashboard statistics).
     */
    long countByStatus(String status);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select r from Reservation r where r.id = :id")
    Optional<Reservation> findLockedById(@org.springframework.data.repository.query.Param("id") Long id);

    boolean existsByUserIdAndStatus(Long userId, String status);
    boolean existsByVehicleId(Long vehicleId);
    boolean existsByParkingSlotId(Long slotId);
}
