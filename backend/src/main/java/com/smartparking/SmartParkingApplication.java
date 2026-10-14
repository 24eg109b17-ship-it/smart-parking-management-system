package com.smartparking;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * SmartParkingApplication - The main entry point of our Spring Boot application.
 *
 * @SpringBootApplication is a combination of three annotations:
 *   - @Configuration: This class can define Spring beans
 *   - @EnableAutoConfiguration: Spring Boot auto-configures based on dependencies
 *   - @ComponentScan: Scans all classes in this package and sub-packages for Spring components
 *
 * When we run this class, Spring Boot:
 *   1. Starts an embedded Tomcat web server on port 8080
 *   2. Connects to MySQL database
 *   3. Creates all the REST API endpoints
 *   4. Makes the application ready to receive HTTP requests
 */
@SpringBootApplication
public class SmartParkingApplication {

    public static void main(String[] args) {
        // SpringApplication.run() bootstraps the entire Spring Boot application
        SpringApplication.run(SmartParkingApplication.class, args);
        System.out.println("==============================================");
        System.out.println("  Smart Parking Management System Started!");
        System.out.println("  Backend running at: http://localhost:8080");
        System.out.println("==============================================");
    }
}
