package com.smartparking.service;

import com.smartparking.dto.VehicleRequest;
import com.smartparking.entity.*;
import com.smartparking.exception.*;
import com.smartparking.repository.*;
import com.smartparking.security.AccessControl;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class VehicleService {
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final ReservationRepository reservations;
    private final ParkingSessionRepository sessions;
    private final AccessControl access;

    @Transactional
    public Vehicle addVehicle(VehicleRequest request) {
        access.requireOwner(request.getUserId());
        User owner = userRepository.findLockedById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        String number = normalize(request.getVehicleNumber());
        if (vehicleRepository.existsByVehicleNumber(number)) {
            throw new BadRequestException("Vehicle number is already registered.");
        }
        Vehicle vehicle = new Vehicle();
        vehicle.setUser(owner);
        apply(vehicle, request, number);
        return vehicleRepository.save(vehicle);
    }

    public List<Vehicle> getVehiclesByUserId(Long userId) {
        access.requireOwner(userId);
        return vehicleRepository.findByUserId(userId);
    }

    public List<Vehicle> getAllVehicles() {
        return vehicleRepository.findAll();
    }

    @Transactional
    public Vehicle updateVehicle(Long vehicleId, VehicleRequest request) {
        Vehicle vehicle = find(vehicleId);
        access.requireOwner(vehicle.getUser().getId());
        if (!vehicle.getUser().getId().equals(request.getUserId())) {
            throw new BadRequestException("Vehicle ownership cannot be changed.");
        }
        userRepository.findLockedById(vehicle.getUser().getId()).orElseThrow();
        requireNoBookings(vehicleId);
        String number = normalize(request.getVehicleNumber());
        if (!number.equals(vehicle.getVehicleNumber()) && vehicleRepository.existsByVehicleNumber(number)) {
            throw new BadRequestException("Vehicle number is already registered.");
        }
        apply(vehicle, request, number);
        return vehicleRepository.save(vehicle);
    }

    @Transactional
    public void deleteVehicle(Long vehicleId) {
        Vehicle vehicle = find(vehicleId);
        access.requireOwner(vehicle.getUser().getId());
        userRepository.findLockedById(vehicle.getUser().getId()).orElseThrow();
        requireNoBookings(vehicleId);
        vehicleRepository.delete(vehicle);
    }

    private void requireNoBookings(Long id) {
        if (reservations.existsByVehicleId(id) || sessions.existsByVehicleId(id)) {
            throw new BadRequestException("Vehicles with booking history cannot be edited or deleted.");
        }
    }

    private Vehicle find(Long id) {
        return vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found."));
    }

    private String normalize(String number) {
        return number.strip().replaceAll("[ -]", "").toUpperCase(Locale.ROOT);
    }

    private void apply(Vehicle vehicle, VehicleRequest request, String number) {
        vehicle.setVehicleNumber(number);
        vehicle.setVehicleType(request.getVehicleType());
        vehicle.setModel(request.getModel());
    }
}
