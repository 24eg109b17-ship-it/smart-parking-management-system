package com.smartparking.service;

import com.smartparking.entity.*;
import com.smartparking.exception.*;
import com.smartparking.repository.*;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ParkingAreaService {
    private final ParkingAreaRepository parkingAreaRepository;
    private final ParkingSlotRepository parkingSlotRepository;
    private final ReservationRepository reservations;
    private final ParkingSessionRepository sessions;

    public List<ParkingArea> getAllParkingAreas() {
        return parkingAreaRepository.findAll();
    }

    public ParkingArea getParkingAreaById(Long id) {
        return parkingAreaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking area not found."));
    }

    @Transactional
    public ParkingArea addParkingArea(ParkingArea area) {
        area.setId(null);
        parkingAreaRepository.save(area);
        for (int i = 1; i <= area.getTotalSlots(); i++) createSlot(area, "S" + String.format("%03d", i), "CAR");
        return area;
    }

    @Transactional
    public ParkingArea updateParkingArea(Long id, ParkingArea updated) {
        ParkingArea area = getParkingAreaById(id);
        List<ParkingSlot> slots = parkingSlotRepository.findByParkingAreaId(id);
        int difference = updated.getTotalSlots() - slots.size();
        if (difference < 0) {
            List<ParkingSlot> removable = slots.stream().filter(this::canRemove).toList();
            if (removable.size() < -difference) {
                throw new BadRequestException("Cannot reduce capacity below slots with reservations or session history.");
            }
            for (int i = 0; i < -difference; i++) parkingSlotRepository.delete(removable.get(i));
        } else {
            int next = 1;
            for (int i = 0; i < difference; i++) {
                String label;
                do { label = "S" + String.format("%03d", next++); }
                while (parkingSlotRepository.existsByParkingAreaIdAndSlotNumberIgnoreCase(id, label));
                createSlot(area, label, "CAR");
            }
        }
        area.setName(updated.getName().strip());
        area.setLocation(updated.getLocation().strip());
        area.setDescription(updated.getDescription());
        area.setPricePerHour(updated.getPricePerHour());
        area.setTotalSlots(updated.getTotalSlots());
        return area;
    }

    @Transactional
    public void deleteParkingArea(Long id) {
        ParkingArea area = getParkingAreaById(id);
        List<ParkingSlot> slots = parkingSlotRepository.findByParkingAreaId(id);
        if (slots.stream().anyMatch(slot -> !canRemove(slot))) {
            throw new BadRequestException("This area has booking history or busy slots and cannot be deleted.");
        }
        parkingSlotRepository.deleteAll(slots);
        parkingAreaRepository.delete(area);
    }

    public List<ParkingSlot> getSlotsByArea(Long id) {
        getParkingAreaById(id);
        return parkingSlotRepository.findByParkingAreaId(id);
    }

    public List<ParkingSlot> getAvailableSlots(Long id) {
        getParkingAreaById(id);
        return parkingSlotRepository.findByParkingAreaIdAndStatus(id, "AVAILABLE");
    }

    @Transactional
    public ParkingSlot addParkingSlot(Long areaId, ParkingSlot slot) {
        ParkingArea area = getParkingAreaById(areaId);
        String label = slot.getSlotNumber().strip().toUpperCase(Locale.ROOT);
        if (parkingSlotRepository.existsByParkingAreaIdAndSlotNumberIgnoreCase(areaId, label)) {
            throw new BadRequestException("That slot number already exists in this area.");
        }
        if (area.getTotalSlots() >= 500) throw new BadRequestException("An area supports at most 500 slots.");
        ParkingSlot created = createSlot(area, label, slot.getSlotType());
        area.setTotalSlots((int) parkingSlotRepository.countByParkingAreaId(areaId));
        return created;
    }

    @Transactional
    public ParkingSlot updateParkingSlot(Long id, ParkingSlot updated) {
        ParkingSlot slot = parkingSlotRepository.findLockedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found."));
        if (!"AVAILABLE".equals(slot.getStatus())) {
            throw new BadRequestException("Reserved or occupied slots cannot be edited.");
        }
        if (updated.getStatus() != null && !updated.getStatus().equals(slot.getStatus())) {
            throw new BadRequestException("Slot status changes only through reservation, entry, and exit.");
        }
        String label = updated.getSlotNumber().strip().toUpperCase(Locale.ROOT);
        if (!label.equalsIgnoreCase(slot.getSlotNumber()) &&
                parkingSlotRepository.existsByParkingAreaIdAndSlotNumberIgnoreCase(slot.getParkingArea().getId(), label)) {
            throw new BadRequestException("That slot number already exists in this area.");
        }
        slot.setSlotNumber(label);
        slot.setSlotType(updated.getSlotType());
        return slot;
    }

    @Transactional
    public void deleteParkingSlot(Long id) {
        ParkingSlot slot = parkingSlotRepository.findLockedById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found."));
        if (!canRemove(slot)) throw new BadRequestException("Slots with booking history cannot be deleted.");
        ParkingArea area = slot.getParkingArea();
        if (area.getTotalSlots() <= 1) throw new BadRequestException("Keep at least one slot in each area.");
        parkingSlotRepository.delete(slot);
        parkingSlotRepository.flush();
        area.setTotalSlots((int) parkingSlotRepository.countByParkingAreaId(area.getId()));
    }

    public List<ParkingSlot> getAllSlots() {
        return parkingSlotRepository.findAll();
    }

    public ParkingSlot getSlotById(Long id) {
        return parkingSlotRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Parking slot not found."));
    }

    private boolean canRemove(ParkingSlot slot) {
        return "AVAILABLE".equals(slot.getStatus()) &&
                !reservations.existsByParkingSlotId(slot.getId()) && !sessions.existsByParkingSlotId(slot.getId());
    }

    private ParkingSlot createSlot(ParkingArea area, String label, String type) {
        ParkingSlot slot = new ParkingSlot();
        slot.setSlotNumber(label);
        slot.setSlotType(type);
        slot.setStatus("AVAILABLE");
        slot.setParkingArea(area);
        return parkingSlotRepository.save(slot);
    }
}
