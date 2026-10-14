# Smart Parking Management System

A React and Spring Boot application for campus parking: reserve a space, record arrival, track an active stay, and generate a parking receipt on departure.

This project builds on the supplied Smart Parking Management System starter archive. The completed version adds the missing admin screens, server-side authentication and ownership checks, password hashing, reliable reservation transitions, automated tests, and deployment configuration.

## Features

- Driver registration and login, with signed bearer tokens and BCrypt password hashing.
- Vehicle registration with normalized, unique registration numbers.
- Parking areas and a visual slot grid for car, bike, and truck spaces.
- Reservations, cancellation, vehicle entry, and vehicle exit.
- Live elapsed-time display, hourly charges, receipt summaries, and history.
- Admin dashboards, users, vehicles, area/slot management, reservations, active sessions, and CSV receipt export.
- Capacity updates that create actual spaces, and protections for records with booking history.

Availability is refreshed from the API when a page loads or an action completes; it is not a sensor feed. Parking fees are calculated records, not online payment transactions. The bundled campus areas are sample data.

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite 8, React Router 7, Axios, CSS |
| Backend | Java 21, Spring Boot 3.2, Spring Security, Spring Data JPA |
| Authentication | Signed HS256 bearer tokens, BCrypt passwords |
| Database | File-based H2 locally; MySQL or PostgreSQL through environment settings |
| Hosting | Render static frontend and Railway Docker API |
| Verification | JUnit / MockMvc integration tests and Node's test runner |

## Run locally

Requires JDK 21, Maven 3.9+, and Node.js 22.12+ (Node 24 recommended). Commands below run from this repository.

### Backend — local demo

```sh
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=demo
```

PowerShell users can quote the Maven property:

```powershell
cd backend
mvn spring-boot:run "-Dspring-boot.run.profiles=demo"
```

The demo profile uses disposable in-memory H2 storage and creates these local-only accounts:

| Role | Email | Password |
| --- | --- | --- |
| Driver | demo@smartparking.com | demo123 |
| Administrator | admin@smartparking.com | admin123 |

The default profile uses a persistent local database under `backend/data/` and does **not** create the fixed-password demo accounts. For that mode, set `ADMIN_EMAIL` and `ADMIN_PASSWORD` to create your own administrator. Public registration always creates a driver account.

### Frontend — another terminal

```sh
cd frontend
npm ci
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api` to `http://127.0.0.1:8080`. To use another backend port, set `API_PROXY_TARGET` before starting Vite. Application routes use hash routing so direct links work on static hosts without a rewrite rule.

### Docker Compose

Copy `.env.example` to `.env`, replace the JWT and administrator placeholders, then run:

```sh
docker compose up --build
```

Frontend: `http://localhost:5173`. API health: `http://localhost:8080/api/health`. The named volume `parking_data` preserves the local H2 database.

## Configuration

| Variable | Purpose |
| --- | --- |
| `PORT` | Backend HTTP port, default 8080. |
| `JWT_SECRET` | Private random signing secret with at least 32 UTF-8 bytes. Without it, local startup generates an ephemeral secret; tokens then expire on restart. |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Create an administrator if the email does not already exist. The password must contain 8–72 characters. Changing these variables does not reset an existing account's password. |
| `DEMO_ENABLED` | Defaults to false. Enables publicly known local demo accounts when true; keep false when hosting. |
| `CORS_ALLOWED_ORIGINS` | Exact frontend origins separated by commas, e.g. `https://your-site.onrender.com`. |
| `DB_URL` | JDBC database URL. Default: file-based H2 under `./data/parking`. |
| `DB_USERNAME`, `DB_PASSWORD` | Database credentials. Default local H2 user: `sa`, blank password. |
| `VITE_API_BASE_URL` | Frontend build-time API URL ending in `/api`; defaults to `/api`. |
| `VITE_DEMO_ENABLED` | Show fixed-account demo shortcuts in a production frontend build. Keep false for hosted use. |

Maven/Java does not load `.env` automatically: use process environment variables or your hosting platform's variable settings. Docker Compose reads the root `.env`. Values prefixed with `VITE_` are public and must not contain secrets.

## Parking rules

1. A driver can have one active reservation or parking session at a time.
2. Reservations must use a vehicle owned by the selected driver and a matching slot type.
3. Database row locks prevent two drivers from reserving the same slot concurrently.
4. Entry must match the active reservation's driver, vehicle, and slot.
5. Slot state follows `AVAILABLE → RESERVED → OCCUPIED → AVAILABLE`; cancellation releases a reservation.
6. Charges use a one-hour minimum and round each started hour up. At ₹20/hour, a 60-minute stay costs ₹20 and a 60-minute-and-one-second stay costs ₹40.
7. The hourly rate is captured at entry; later rate edits cannot change that stay's charges.
8. Booking history prevents destructive deletion of referenced vehicles, slots, and areas.
9. Timestamps are sent as UTC and displayed in the viewer's locale.

## API outline

Register/login at `POST /api/auth/register` and `POST /api/auth/login`. Use the returned `token` in `Authorization: Bearer <token>` for protected requests.

| Route | Purpose |
| --- | --- |
| `GET /api/health` | Public health check |
| `GET /api/auth/me` | Verify the authenticated account |
| `/api/vehicles`, `/api/vehicles/user/{id}` | Manage owned vehicles |
| `/api/parking-areas`, `/api/parking-slots` | Browse areas/spaces; admin-only mutations |
| `POST /api/reservations` | Reserve an available slot |
| `PUT /api/reservations/{id}/cancel` | Cancel an owned booking |
| `POST /api/parking/entry` | Start a reserved stay |
| `POST /api/parking/exit/{id}` | End a stay and calculate charges |
| `GET /api/parking/active/{userId}` | Current stay |
| `GET /api/parking/history/{userId}` | Completed stays |
| `/api/admin/dashboard`, `/api/admin/users` | Admin reporting |

Admin-wide vehicle, reservation, and session lists require an admin token. Users cannot access another driver's records by changing an ID.

## Verification

```sh
cd backend
mvn -B verify
```

```sh
cd frontend
npm ci
npm run lint
npm test
npm run build
```

The integration suite covers authorization, password exposure, registration validation, ownership, the full booking lifecycle, rate snapshots, partial-hour billing, vehicle types, normalized duplicates, capacity/history protection, and concurrent slot reservations. GitHub Actions runs the backend and frontend checks.

## Deployment

### Railway API

Use the repository-root `Dockerfile` and `railway.json`. Set a private `JWT_SECRET`, your own administrator credentials, `DEMO_ENABLED=false`, and the Render frontend origin in `CORS_ALLOWED_ORIGINS`.

For durable single-instance H2 storage, attach a volume at `/app/data` and set `DB_URL=jdbc:h2:file:/app/data/parking;DB_CLOSE_ON_EXIT=FALSE`. Use one replica. For multiple replicas, use an external MySQL/PostgreSQL database instead. Without a volume/external database, container redeploys can lose data.

### Render frontend

Create a static site from this repository with:

- Build command: `cd frontend && npm ci && npm run build`
- Publish directory: `frontend/dist`
- Node version: `24`
- `VITE_API_BASE_URL=https://<your-railway-domain>/api`
- `VITE_DEMO_ENABLED=false`

The repository includes `render.yaml`. Check the API health endpoint, driver registration, reservation/entry/exit, and admin reporting after deployment.

Trial credits and free service limits are controlled by the hosting providers. Review the account's remaining credit and service lifecycle before relying on the deployment long-term.

## Layout

```text
backend/
  src/main/java/com/smartparking/  Controllers, services, persistence, security
  src/test/java/com/smartparking/  Integration tests
frontend/
  src/pages/                      Driver and admin screens
  src/components/                 Shared UI and record tables
  src/lib/                        Formatting, CSV export, tests
Dockerfile                        Railway API image
docker-compose.yml                Local frontend + API + persistent volume
railway.json                      API build and health settings
render.yaml                       Static frontend settings
.github/workflows/ci.yml           Automated verification
```
