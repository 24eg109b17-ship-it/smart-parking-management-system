package com.smartparking.exception;

/**
 * ResourceNotFoundException - Custom exception for when a requested resource is not found.
 *
 * Instead of letting Spring return a confusing error, we throw this exception
 * with a clear human-readable message like "User not found with ID: 5"
 *
 * RuntimeException means we don't need to declare it in method signatures (unchecked exception).
 */
public class ResourceNotFoundException extends RuntimeException {

    /**
     * Constructor that takes a descriptive error message.
     * Example: throw new ResourceNotFoundException("Parking slot not found with ID: " + id);
     */
    public ResourceNotFoundException(String message) {
        // Pass the message to the parent RuntimeException class
        super(message);
    }
}
