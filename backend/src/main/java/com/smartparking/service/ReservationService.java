package com.smartparking.service;

import com.smartparking.dto.ReservationRequest;
import com.smartparking.entity.*;
import com.smartparking.exception.*;
import com.smartparking.repository.*;
import com.smartparking.security.AccessControl;
import java.util.Comparator;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ReservationService {
    private final ReservationRepository reservationRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final UserRepository userRepository;
    private final VehicleRepository vehicleRepository;
    private final ParkingSessionRepository sessionRepository;
    private final AccessControl access;
    private final jakarta.persistence.EntityManager entityManager;

    @Transactional
    public Reservation createReservation(ReservationRequest request) {
        access.requireOwner(request.getUserId());
        User user = userRepository.findLockedById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        ParkingSlot slot = parkingSlotRepository.findLockedById(request.getParkingSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found."));
        if (!"AVAILABLE".equals(slot.getStatus())) {
            throw new BadRequestException("This slot is no longer available. Choose another slot.");
        }
        if (reservationRepository.existsByUserIdAndStatus(user.getId(), "ACTIVE") ||
                sessionRepository.existsByUserIdAndStatus(user.getId(), "ACTIVE")) {
            throw new BadRequestException("Complete or cancel your existing parking booking first.");
        }
        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found."));
        if (!vehicle.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("This vehicle does not belong to the selected user.");
        }
        if (!vehicle.getVehicleType().equals(slot.getSlotType())) {
            throw new BadRequestException("Choose a " + slot.getSlotType() + " vehicle for this slot.");
        }
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setVehicle(vehicle);
        reservation.setParkingSlot(slot);
        reservation.setStatus("ACTIVE");
        slot.setStatus("RESERVED");
        return reservationRepository.save(reservation);
    }

    @Transactional(readOnly = true)
    public List<Reservation> getReservationsByUser(Long userId) {
        access.requireOwner(userId);
        return reservationRepository.findByUserId(userId).stream()
                .sorted(Comparator.comparing(Reservation::getReservationTime).reversed()).toList();
    }

    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll().stream()
                .sorted(Comparator.comparing(Reservation::getReservationTime).reversed()).toList();
    }

    @Transactional
    public Reservation cancelReservation(Long reservationId) {
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found."));
        access.requireOwner(reservation.getUser().getId());
        userRepository.findLockedById(reservation.getUser().getId()).orElseThrow();
        ParkingSlot slot = parkingSlotRepository.findLockedById(reservation.getParkingSlot().getId()).orElseThrow();
        entityManager.refresh(reservation, jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);
        if (!"ACTIVE".equals(reservation.getStatus()) || !"RESERVED".equals(slot.getStatus())) {
            throw new BadRequestException("Only an active reservation can be cancelled.");
        }
        reservation.setStatus("CANCELLED");
        slot.setStatus("AVAILABLE");
        return reservationRepository.save(reservation);
    }
}
