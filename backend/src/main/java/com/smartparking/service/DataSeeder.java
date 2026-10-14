package com.smartparking.service;

import com.smartparking.entity.*;
import com.smartparking.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {
    private final UserRepository users;
    private final ParkingAreaRepository areas;
    private final ParkingSlotRepository slots;
    private final PasswordEncoder passwords;

    @Value("${app.demo.enabled:false}") private boolean demo;
    @Value("${app.admin.email:}") private String adminEmail;
    @Value("${app.admin.password:}") private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        if (!adminEmail.isBlank()) {
            if (adminPassword.length() < 8 || adminPassword.length() > 72) {
                throw new IllegalArgumentException("ADMIN_PASSWORD must contain 8 to 72 characters.");
            }
            createUser("Parking Administrator", adminEmail.strip().toLowerCase(), adminPassword, "ADMIN");
        }
        if (demo) {
            createUser("Demo Administrator", "admin@smartparking.com", "admin123", "ADMIN");
            createUser("Demo Driver", "demo@smartparking.com", "demo123", "USER");
        }
        if (areas.count() == 0) {
            createArea("Main Campus", "North entrance · Gate 1", 10, 20, "A", 8);
            createArea("Library Quarter", "Library building · East wing", 8, 15, "B", 4);
            createArea("Sports Complex", "South gate · Visitor entrance", 6, 10, "C", 3);
        }
    }

    private void createUser(String name, String email, String password, String role) {
        if (users.existsByEmail(email)) return;
        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwords.encode(password));
        user.setRole(role);
        users.save(user);
    }

    private void createArea(String name, String location, int count, double rate, String prefix, int carSlots) {
        ParkingArea area = new ParkingArea();
        area.setName(name);
        area.setLocation(location);
        area.setTotalSlots(count);
        area.setPricePerHour(rate);
        area.setDescription("Sample campus parking area. Reserve an available space before arrival.");
        areas.save(area);
        for (int i = 1; i <= count; i++) {
            ParkingSlot slot = new ParkingSlot();
            slot.setSlotNumber(prefix + String.format("%02d", i));
            slot.setSlotType(i <= carSlots ? "CAR" : "BIKE");
            slot.setStatus("AVAILABLE");
            slot.setParkingArea(area);
            slots.save(slot);
        }
    }
}
