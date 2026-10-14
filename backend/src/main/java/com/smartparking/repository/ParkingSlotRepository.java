package com.smartparking.repository;

import com.smartparking.entity.ParkingSlot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * ParkingSlotRepository - Handles database operations for ParkingSlot entity.
 *
 * Custom methods allow us to:
 * 1. Find all slots in a parking area
 * 2. Find only available slots (for reservation)
 * 3. Count slots by status (for dashboard statistics)
 */
@Repository
public interface ParkingSlotRepository extends JpaRepository<ParkingSlot, Long> {

    /**
     * Get all parking slots in a specific parking area.
     * Spring generates: SELECT * FROM parking_slots WHERE parking_area_id = ?
     * Used to show the visual grid of slots for a selected parking area.
     */
    List<ParkingSlot> findByParkingAreaId(Long parkingAreaId);

    /**
     * Get only available slots in a specific parking area.
     * Spring generates: SELECT * FROM parking_slots WHERE parking_area_id = ? AND status = ?
     * Used to show which slots the user can reserve.
     */
    List<ParkingSlot> findByParkingAreaIdAndStatus(Long parkingAreaId, String status);

    /**
     * Count total slots with a specific status across all areas.
     * Spring generates: SELECT COUNT(*) FROM parking_slots WHERE status = ?
     * Used for Admin Dashboard statistics (total available, reserved, occupied).
     */
    long countByStatus(String status);

    /**
     * Count slots with a specific status in a specific parking area.
     * Used to show available slot count in each parking area card.
     */
    long countByParkingAreaIdAndStatus(Long parkingAreaId, String status);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select s from ParkingSlot s where s.id = :id")
    java.util.Optional<ParkingSlot> findLockedById(@org.springframework.data.repository.query.Param("id") Long id);

    boolean existsByParkingAreaIdAndSlotNumberIgnoreCase(Long areaId, String slotNumber);
    long countByParkingAreaId(Long areaId);
}
