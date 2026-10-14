package com.smartparking.controller;

import com.smartparking.dto.AuthResponse;
import com.smartparking.dto.LoginRequest;
import com.smartparking.dto.RegisterRequest;
import com.smartparking.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * AuthController - Handles user registration and login HTTP requests.
 *
 * The Controller is the ENTRY POINT for HTTP requests from the frontend.
 * Its responsibilities are:
 * 1. Receive the HTTP request
 * 2. Extract the data (from request body, path variables, etc.)
 * 3. Call the appropriate Service method
 * 4. Return the HTTP response
 *
 * Controllers should NOT contain business logic - that belongs in the Service layer.
 *
 * @RestController - Combination of @Controller and @ResponseBody.
 *                   Every method returns data (as JSON) instead of a view template.
 * @RequestMapping - All endpoints in this class start with "/api/auth"
 * @CrossOrigin   - NOT needed here because we configured CORS globally in CorsConfig.java
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    /**
     * @Autowired - Spring injects the AuthService instance automatically.
     * We don't create it manually.
     */
    @Autowired
    private AuthService authService;

    /**
     * POST /api/auth/register
     * Register a new user account.
     *
     * Frontend sends: { "name": "John", "email": "john@email.com", "password": "pass123", "phone": "9876543210" }
     * Backend returns: { "id": 1, "name": "John", "email": "...", "role": "USER", "message": "...", "success": true }
     *
     * @jakarta.validation.Valid @RequestBody - Spring converts the incoming JSON to a RegisterRequest object automatically
     * ResponseEntity - Allows us to set the HTTP status code along with the response body
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@jakarta.validation.Valid @RequestBody RegisterRequest request) {
        // Delegate to the service for business logic
        AuthResponse response = authService.register(request);
        // Return HTTP 200 OK with the auth response
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<com.smartparking.entity.User> me(java.security.Principal principal) {
        return ResponseEntity.ok(authService.getUserById(Long.valueOf(principal.getName())));
    }

    /**
     * POST /api/auth/login
     * Login an existing user.
     *
     * Frontend sends: { "email": "john@email.com", "password": "pass123" }
     * Backend returns: { "id": 1, "name": "John", "email": "...", "role": "USER", "message": "...", "success": true }
     */
    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@jakarta.validation.Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }
}
