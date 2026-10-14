package com.smartparking.service;

import com.smartparking.dto.ParkingEntryRequest;
import com.smartparking.entity.*;
import com.smartparking.exception.*;
import com.smartparking.repository.*;
import com.smartparking.security.AccessControl;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ParkingSessionService {
    private final ParkingSessionRepository sessionRepository;
    private final ParkingSlotRepository slotRepository;
    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final AccessControl access;
    private final jakarta.persistence.EntityManager entityManager;

    @Transactional
    public ParkingSession recordEntry(ParkingEntryRequest request) {
        access.requireOwner(request.getUserId());
        User user = userRepository.findLockedById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found."));
        ParkingSlot slot = slotRepository.findLockedById(request.getParkingSlotId())
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found."));
        Reservation reservation = reservationRepository.findLockedById(request.getReservationId())
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found."));
        if (!reservation.getUser().getId().equals(user.getId()) ||
                !reservation.getVehicle().getId().equals(request.getVehicleId()) ||
                !reservation.getParkingSlot().getId().equals(slot.getId())) {
            throw new BadRequestException("The reservation, vehicle, user, and slot must match.");
        }
        if (!"ACTIVE".equals(reservation.getStatus()) || !"RESERVED".equals(slot.getStatus())) {
            throw new BadRequestException("This reservation is no longer available for entry.");
        }
        if (sessionRepository.existsByUserIdAndStatus(user.getId(), "ACTIVE")) {
            throw new BadRequestException("You already have an active parking session.");
        }
        ParkingSession session = new ParkingSession();
        session.setUser(user);
        session.setVehicle(reservation.getVehicle());
        session.setParkingSlot(slot);
        session.setEntryTime(LocalDateTime.now(Clock.systemUTC()));
        session.setPricePerHour(slot.getParkingArea().getPricePerHour());
        session.setStatus("ACTIVE");
        reservation.setStatus("COMPLETED");
        slot.setStatus("OCCUPIED");
        return sessionRepository.save(session);
    }

    @Transactional
    public ParkingSession recordExit(Long sessionId) {
        ParkingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking session not found."));
        access.requireOwner(session.getUser().getId());
        userRepository.findLockedById(session.getUser().getId()).orElseThrow();
        ParkingSlot slot = slotRepository.findLockedById(session.getParkingSlot().getId()).orElseThrow();
        entityManager.refresh(session, jakarta.persistence.LockModeType.PESSIMISTIC_WRITE);
        if (!"ACTIVE".equals(session.getStatus())) {
            throw new BadRequestException("This parking session is already completed.");
        }
        LocalDateTime exit = LocalDateTime.now(Clock.systemUTC());
        long millis = Math.max(1, Duration.between(session.getEntryTime(), exit).toMillis());
        long minutes = Math.max(1, (millis + 59999) / 60000);
        long billableHours = Math.max(1, (millis + 3599999) / 3600000);
        double rate = session.getPricePerHour() != null ? session.getPricePerHour() : slot.getParkingArea().getPricePerHour();
        double total = BigDecimal.valueOf(rate).multiply(BigDecimal.valueOf(billableHours))
                .setScale(2, RoundingMode.HALF_UP).doubleValue();
        session.setExitTime(exit);
        session.setDurationMinutes(minutes);
        session.setTotalAmount(total);
        session.setStatus("COMPLETED");
        slot.setStatus("AVAILABLE");
        return sessionRepository.save(session);
    }

    public Optional<ParkingSession> getActiveSession(Long userId) {
        access.requireOwner(userId);
        return sessionRepository.findByUserIdAndStatus(userId, "ACTIVE");
    }

    public List<ParkingSession> getParkingHistory(Long userId) {
        access.requireOwner(userId);
        return sessionRepository.findByUserIdAndStatusOrderByEntryTimeDesc(userId, "COMPLETED");
    }

    public List<ParkingSession> getAllActiveSessions() {
        return sessionRepository.findByStatus("ACTIVE");
    }

    public List<ParkingSession> getAllCompletedSessions() {
        return sessionRepository.findByStatus("COMPLETED").stream()
                .sorted(java.util.Comparator.comparing(ParkingSession::getEntryTime).reversed()).toList();
    }

    public ParkingSession getSessionById(Long sessionId) {
        ParkingSession session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new ResourceNotFoundException("Parking session not found."));
        access.requireOwner(session.getUser().getId());
        return session;
    }
}
