package com.smartparking;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartparking.entity.*;
import com.smartparking.repository.*;
import java.time.Clock;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.*;
import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.*;

import static org.assertj.core.api.Assertions.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
    "spring.datasource.url=jdbc:h2:mem:parking-tests;DB_CLOSE_DELAY=-1",
    "spring.jpa.hibernate.ddl-auto=create-drop",
    "app.demo.enabled=false",
    "app.admin.email=",
    "app.admin.password="
})
@AutoConfigureMockMvc
class ParkingWorkflowTest {
    @Autowired MockMvc mvc;
    @Autowired ObjectMapper json;
    @Autowired UserRepository users;
    @Autowired VehicleRepository vehicles;
    @Autowired ParkingAreaRepository areas;
    @Autowired ParkingSlotRepository slots;
    @Autowired ReservationRepository reservations;
    @Autowired ParkingSessionRepository sessions;
    @Autowired PasswordEncoder passwords;

    ParkingArea area;
    ParkingSlot slot;

    @BeforeEach
    void reset() {
        sessions.deleteAll();
        reservations.deleteAll();
        vehicles.deleteAll();
        slots.deleteAll();
        areas.deleteAll();
        users.deleteAll();
        area = new ParkingArea();
        area.setName("Test campus");
        area.setLocation("North gate");
        area.setPricePerHour(20);
        area.setTotalSlots(1);
        area = areas.save(area);
        slot = new ParkingSlot();
        slot.setSlotNumber("A01");
        slot.setSlotType("CAR");
        slot.setStatus("AVAILABLE");
        slot.setParkingArea(area);
        slot = slots.save(slot);
    }

    JsonNode account(String name) throws Exception {
        return call(post("/api/auth/register"), null, Map.of("name", name, "email", name + "@example.com",
                "password", "Driver-Test-123"), 200);
    }

    JsonNode admin() throws Exception {
        User admin = new User();
        admin.setName("Administrator");
        admin.setEmail("administrator@example.com");
        admin.setRole("ADMIN");
        admin.setPassword(passwords.encode("Admin-Test-123"));
        users.save(admin);
        return call(post("/api/auth/login"), null, Map.of("email", admin.getEmail(), "password", "Admin-Test-123"), 200);
    }

    JsonNode vehicle(JsonNode account, String number, String type) throws Exception {
        return call(post("/api/vehicles"), account, Map.of("userId", account.get("id").asLong(),
                "vehicleNumber", number, "vehicleType", type, "model", "Test vehicle"), 200);
    }

    JsonNode reserve(JsonNode account, JsonNode vehicle, long slotId) throws Exception {
        return call(post("/api/reservations"), account, Map.of("userId", account.get("id").asLong(),
                "vehicleId", vehicle.get("id").asLong(), "parkingSlotId", slotId), 200);
    }

    Map<String, Object> entry(JsonNode account, JsonNode vehicle, JsonNode reservation) {
        return Map.of("userId", account.get("id").asLong(), "vehicleId", vehicle.get("id").asLong(),
                "parkingSlotId", slot.getId(), "reservationId", reservation.get("id").asLong());
    }

    JsonNode call(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder request,
            JsonNode account, Object body, int status) throws Exception {
        request.contentType(MediaType.APPLICATION_JSON);
        if (account != null) request.header("Authorization", "Bearer " + account.get("token").asText());
        if (body != null) request.content(json.writeValueAsString(body));
        String content = mvc.perform(request).andExpect(status().is(status)).andReturn().getResponse().getContentAsString();
        return content.isBlank() ? json.nullNode() : json.readTree(content);
    }

    @Test void healthIsPublicAndAdminRequiresAuthentication() throws Exception {
        call(get("/api/health"), null, null, 200);
        call(get("/api/admin/dashboard"), null, null, 401);
        JsonNode driver = account("driver");
        call(get("/api/admin/dashboard"), driver, null, 403);
        call(post("/api/parking-areas"), driver, Map.of(), 403);
        call(get("/api/admin/dashboard"), admin(), null, 200);
    }

    @Test void passwordsAreHashedAndNeverReturned() throws Exception {
        JsonNode driver = account("driver");
        User saved = users.findById(driver.get("id").asLong()).orElseThrow();
        assertThat(saved.getPassword()).isNotEqualTo("Driver-Test-123");
        assertThat(passwords.matches("Driver-Test-123", saved.getPassword())).isTrue();
        JsonNode me = call(get("/api/auth/me"), driver, null, 200);
        assertThat(me.has("password")).isFalse();
        JsonNode allUsers = call(get("/api/admin/users"), admin(), null, 200);
        assertThat(allUsers.toString()).doesNotContain("password").doesNotContain("$2a$");
    }

    @Test void registrationValidatesAndCannotEscalateRole() throws Exception {
        call(post("/api/auth/register"), null, Map.of("name", "", "email", "bad", "password", "x"), 400);
        JsonNode driver = call(post("/api/auth/register"), null,
                Map.of("name", "Driver", "email", "DRIVER@example.com", "password", "Driver-Test-123", "role", "ADMIN"), 200);
        assertThat(driver.get("role").asText()).isEqualTo("USER");
        assertThat(driver.get("email").asText()).isEqualTo("driver@example.com");
        call(post("/api/auth/login"), null, Map.of("email", "driver@example.com", "password", "wrong"), 401);
        call(post("/api/auth/login"), null, Map.of("email", "missing@example.com", "password", "wrong"), 401);
    }

    @Test void cannotReadOrModifyAnotherDriversRecords() throws Exception {
        JsonNode alice = account("alice");
        JsonNode bob = account("bob");
        JsonNode car = vehicle(alice, "TS09AB1234", "CAR");
        long bobId = bob.get("id").asLong();
        call(get("/api/vehicles/user/" + bobId), alice, null, 403);
        call(get("/api/reservations/user/" + bobId), alice, null, 403);
        call(post("/api/vehicles"), alice, Map.of("userId", bobId, "vehicleNumber", "TS09CD1234", "vehicleType", "CAR"), 403);
        call(delete("/api/vehicles/" + car.get("id").asLong()), bob, null, 403);
        JsonNode reservation = reserve(alice, car, slot.getId());
        call(put("/api/reservations/" + reservation.get("id").asLong() + "/cancel"), bob, null, 403);
    }

    @Test void fullLifecycleAndMinimumHourlyBilling() throws Exception {
        JsonNode driver = account("driver");
        JsonNode car = vehicle(driver, "TS09AB1234", "CAR");
        JsonNode reservation = reserve(driver, car, slot.getId());
        assertThat(slots.findById(slot.getId()).orElseThrow().getStatus()).isEqualTo("RESERVED");
        JsonNode session = call(post("/api/parking/entry"), driver, entry(driver, car, reservation), 200);
        assertThat(slots.findById(slot.getId()).orElseThrow().getStatus()).isEqualTo("OCCUPIED");
        call(post("/api/parking/entry"), driver, entry(driver, car, reservation), 400);
        JsonNode completed = call(post("/api/parking/exit/" + session.get("id").asLong()), driver, null, 200);
        assertThat(completed.get("totalAmount").asDouble()).isEqualTo(20);
        assertThat(completed.get("durationMinutes").asLong()).isEqualTo(1);
        assertThat(completed.get("entryTime").asText()).endsWith("Z");
        assertThat(slots.findById(slot.getId()).orElseThrow().getStatus()).isEqualTo("AVAILABLE");
        call(post("/api/parking/exit/" + session.get("id").asLong()), driver, null, 400);
        assertThat(call(get("/api/parking/history/" + driver.get("id").asLong()), driver, null, 200)).hasSize(1);
    }

    @Test void partialHourIsRoundedUpAndRateIsSnapshotted() throws Exception {
        JsonNode driver = account("driver");
        JsonNode car = vehicle(driver, "TS09AB1234", "CAR");
        JsonNode reservation = reserve(driver, car, slot.getId());
        JsonNode response = call(post("/api/parking/entry"), driver, entry(driver, car, reservation), 200);
        ParkingSession session = sessions.findById(response.get("id").asLong()).orElseThrow();
        session.setEntryTime(LocalDateTime.now(Clock.systemUTC()).minusHours(1).minusSeconds(3));
        sessions.save(session);
        area.setPricePerHour(100);
        areas.save(area);
        JsonNode completed = call(post("/api/parking/exit/" + session.getId()), driver, null, 200);
        assertThat(completed.get("totalAmount").asDouble()).isEqualTo(40);
        assertThat(completed.get("pricePerHour").asDouble()).isEqualTo(20);
    }

    @Test void entryMustMatchReservationAndVehicleOwner() throws Exception {
        JsonNode alice = account("alice");
        JsonNode bob = account("bob");
        JsonNode aliceCar = vehicle(alice, "TS09AB1234", "CAR");
        JsonNode bobCar = vehicle(bob, "TS09CD1234", "CAR");
        JsonNode reservation = reserve(alice, aliceCar, slot.getId());
        call(post("/api/parking/entry"), bob, Map.of("userId", bob.get("id").asLong(), "vehicleId", bobCar.get("id").asLong(),
                "parkingSlotId", slot.getId(), "reservationId", reservation.get("id").asLong()), 400);
        call(post("/api/parking/entry"), alice, Map.of("userId", alice.get("id").asLong(),
                "vehicleId", aliceCar.get("id").asLong(), "parkingSlotId", slot.getId()), 400);
        assertThat(reservations.findById(reservation.get("id").asLong()).orElseThrow().getStatus()).isEqualTo("ACTIVE");
    }

    @Test void vehicleTypeAndOneBookingPerDriverAreEnforced() throws Exception {
        JsonNode driver = account("driver");
        JsonNode bike = vehicle(driver, "TS09AB1234", "BIKE");
        call(post("/api/reservations"), driver, Map.of("userId", driver.get("id").asLong(), "vehicleId", bike.get("id").asLong(),
                "parkingSlotId", slot.getId()), 400);
        JsonNode car = vehicle(driver, "TS09CD1234", "CAR");
        JsonNode reservation = reserve(driver, car, slot.getId());
        JsonNode administrator = admin();
        JsonNode secondSlot = call(post("/api/parking-slots/area/" + area.getId()), administrator,
                Map.of("slotNumber", "A02", "slotType", "CAR"), 200);
        call(post("/api/reservations"), driver, Map.of("userId", driver.get("id").asLong(), "vehicleId", car.get("id").asLong(),
                "parkingSlotId", secondSlot.get("id").asLong()), 400);
        call(put("/api/reservations/" + reservation.get("id").asLong() + "/cancel"), driver, null, 200);
        reserve(driver, car, secondSlot.get("id").asLong());
    }

    @Test void duplicateVehicleNumbersAreNormalized() throws Exception {
        JsonNode driver = account("driver");
        JsonNode first = vehicle(driver, "ts 09 ab 1234", "CAR");
        assertThat(first.get("vehicleNumber").asText()).isEqualTo("TS09AB1234");
        call(post("/api/vehicles"), driver, Map.of("userId", driver.get("id").asLong(),
                "vehicleNumber", "TS09AB1234", "vehicleType", "CAR"), 400);
    }

    @Test void areasCreateRealSlotsAndHistoryIsProtected() throws Exception {
        JsonNode administrator = admin();
        JsonNode created = call(post("/api/parking-areas"), administrator, Map.of("name", "Visitors", "location", "West",
                "totalSlots", 3, "pricePerHour", 12), 200);
        assertThat(call(get("/api/parking-slots/area/" + created.get("id").asLong()), administrator, null, 200)).hasSize(3);
        JsonNode driver = account("driver");
        JsonNode car = vehicle(driver, "TS09AB1234", "CAR");
        reserve(driver, car, slot.getId());
        call(delete("/api/vehicles/" + car.get("id").asLong()), driver, null, 400);
        call(delete("/api/parking-slots/" + slot.getId()), administrator, null, 400);
        call(delete("/api/parking-areas/" + area.getId()), administrator, null, 400);
        call(put("/api/parking-slots/" + slot.getId()), administrator,
                Map.of("slotNumber", "A01", "slotType", "CAR", "status", "AVAILABLE"), 400);
    }

    @Test void concurrentRequestsCannotDoubleBookOneSlot() throws Exception {
        JsonNode alice = account("alice");
        JsonNode bob = account("bob");
        JsonNode first = vehicle(alice, "TS09AB1234", "CAR");
        JsonNode second = vehicle(bob, "TS09CD1234", "CAR");
        CountDownLatch start = new CountDownLatch(1);
        ExecutorService pool = Executors.newFixedThreadPool(2);
        try {
            Future<Integer> a = pool.submit(() -> reserveConcurrently(start, alice, first));
            Future<Integer> b = pool.submit(() -> reserveConcurrently(start, bob, second));
            start.countDown();
            assertThat(java.util.List.of(a.get(15, TimeUnit.SECONDS), b.get(15, TimeUnit.SECONDS)))
                    .containsExactlyInAnyOrder(200, 400);
            assertThat(reservations.count()).isEqualTo(1);
        } finally { pool.shutdownNow(); }
    }

    int reserveConcurrently(CountDownLatch start, JsonNode driver, JsonNode car) throws Exception {
        start.await();
        return mvc.perform(post("/api/reservations").header("Authorization", "Bearer " + driver.get("token").asText())
                .contentType(MediaType.APPLICATION_JSON).content(json.writeValueAsString(Map.of(
                        "userId", driver.get("id").asLong(), "vehicleId", car.get("id").asLong(), "parkingSlotId", slot.getId()))))
                .andReturn().getResponse().getStatus();
    }
}
