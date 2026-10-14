package com.smartparking.exception;

/**
 * BadRequestException - Custom exception for invalid business logic requests.
 *
 * Used when the request is syntactically valid but breaks business rules.
 * Examples:
 * - Trying to reserve an already occupied slot
 * - Trying to exit when there's no active session
 * - Registering with a duplicate email
 */
public class BadRequestException extends RuntimeException {

    public BadRequestException(String message) {
        super(message);
    }
}
