package com.smartparking.dto;

import lombok.Data;

/**
 * LoginRequest DTO - Data sent from the frontend Login form.
 *
 * Simple DTO with just email and password.
 * The backend will look up the user by email and check the password.
 */
@Data
public class LoginRequest {

    // Email used to find the user in the database
    @jakarta.validation.constraints.NotBlank
    @jakarta.validation.constraints.Email
    @jakarta.validation.constraints.Size(max = 254)
    private String email;

    // Password to verify against the stored password
    @jakarta.validation.constraints.NotBlank
    @jakarta.validation.constraints.Size(min = 1, max = 72)
    private String password;
}
