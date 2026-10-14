package com.smartparking.controller;

import com.smartparking.dto.DashboardStats;
import com.smartparking.entity.User;
import com.smartparking.service.AdminService;
import com.smartparking.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * AdminController - Handles admin-specific HTTP requests.
 *
 * Endpoints:
 * GET /api/admin/dashboard → Get all dashboard statistics
 * GET /api/admin/users     → Get all users
 */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @Autowired
    private AuthService authService;

    /**
     * GET /api/admin/dashboard
     * Get all statistics for the Admin Dashboard.
     *
     * Returns a DashboardStats object with all the counts and totals.
     */
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStats> getDashboardStats() {
        DashboardStats stats = adminService.getDashboardStats();
        return ResponseEntity.ok(stats);
    }

    /**
     * GET /api/admin/users
     * Get all registered users in the system.
     */
    @GetMapping("/users")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(authService.getAllUsers());
    }
}
