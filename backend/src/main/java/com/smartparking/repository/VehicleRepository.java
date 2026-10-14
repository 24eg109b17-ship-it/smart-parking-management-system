package com.smartparking.repository;

import com.smartparking.entity.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * VehicleRepository - Handles all database operations for the Vehicle entity.
 *
 * Custom methods use Spring Data JPA naming convention:
 * findBy[FieldName][AnotherField]
 * → Spring auto-generates the SQL query from the method name.
 */
@Repository
public interface VehicleRepository extends JpaRepository<Vehicle, Long> {

    /**
     * Find all vehicles belonging to a specific user.
     * Spring generates: SELECT * FROM vehicles WHERE user_id = ?
     */
    List<Vehicle> findByUserId(Long userId);

    /**
     * Find a vehicle by its registration number.
     * Spring generates: SELECT * FROM vehicles WHERE vehicle_number = ?
     * Used to check for duplicate vehicle numbers.
     */
    Optional<Vehicle> findByVehicleNumber(String vehicleNumber);

    /**
     * Check if a vehicle number is already registered.
     * Spring generates: SELECT COUNT(*) > 0 FROM vehicles WHERE vehicle_number = ?
     */
    boolean existsByVehicleNumber(String vehicleNumber);
}
