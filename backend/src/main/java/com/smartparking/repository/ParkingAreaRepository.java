package com.smartparking.repository;

import com.smartparking.entity.ParkingArea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

/**
 * ParkingAreaRepository - Handles database operations for ParkingArea entity.
 *
 * We get all basic CRUD operations from JpaRepository:
 * - findAll()         → Get all parking areas (displayed on the Parking Areas page)
 * - findById(id)      → Get one parking area by ID
 * - save(area)        → Add or update a parking area
 * - deleteById(id)    → Delete a parking area
 *
 * No custom methods needed here - the default JpaRepository methods are sufficient.
 */
@Repository
public interface ParkingAreaRepository extends JpaRepository<ParkingArea, Long> {
    // All needed methods are inherited from JpaRepository
}
