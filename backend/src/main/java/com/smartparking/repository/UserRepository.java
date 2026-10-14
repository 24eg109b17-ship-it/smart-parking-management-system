package com.smartparking.repository;

import com.smartparking.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * UserRepository - Handles all database operations for the User entity.
 *
 * By extending JpaRepository, we automatically get these methods for free:
 *  - save(user)        → INSERT or UPDATE in MySQL
 *  - findById(id)      → SELECT * FROM users WHERE id = ?
 *  - findAll()         → SELECT * FROM users
 *  - deleteById(id)    → DELETE FROM users WHERE id = ?
 *  - count()           → SELECT COUNT(*) FROM users
 *
 * We add CUSTOM methods using Spring Data JPA's method naming convention.
 * Spring automatically generates the SQL from the method name!
 *
 * @Repository - Marks this as a Spring Repository component
 * JpaRepository<User, Long> - User is the entity type, Long is the primary key type
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find a user by their email address.
     * Spring generates: SELECT * FROM users WHERE email = ?
     * Returns Optional to safely handle "user not found" case.
     */
    Optional<User> findByEmail(String email);

    /**
     * Check if a user with the given email already exists.
     * Spring generates: SELECT COUNT(*) > 0 FROM users WHERE email = ?
     * Used for registration validation (prevent duplicate emails).
     */
    boolean existsByEmail(String email);
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select u from User u where u.id = :id")
    Optional<User> findLockedById(@org.springframework.data.repository.query.Param("id") Long id);
}
