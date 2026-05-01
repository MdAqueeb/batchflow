# BatchFlow

Attendance management system for training institutions. Institutions manage batches and trainers; trainers run sessions; students mark attendance.

```
batchflow-project/
├── batchflow/     # Spring Boot REST API (Java 21)
└── frontend/      # React SPA (Vite)
```

---

## Roles

| Role | Capabilities |
|---|---|
| **Institution** | Create batches, assign trainers, view summaries |
| **Trainer** | Create sessions, generate student invite links, view attendance |
| **Student** | Join batches via invite, mark attendance |
| **Programme Manager** | Full access across all institutions |
| **Monitoring Officer** | Read-only overview |

---

## Backend — `batchflow/`

**Stack:** Spring Boot 3.3 · Java 21 · PostgreSQL · Spring Security (JWT) · JPA/Hibernate · Swagger UI

### Setup

1. Create a PostgreSQL database named `batchflow`
2. Copy and fill in credentials:

```properties
# batchflow/src/main/resources/application-local.properties

spring.datasource.url=jdbc:postgresql://localhost:5432/batchflow
spring.datasource.username=YOUR_USER
spring.datasource.password=YOUR_PASSWORD

jwt.secret=your-secret-key-min-32-characters
jwt.expiration-ms=86400000

app.cors.allowed-origins=http://localhost:5173
```

3. Run:

```bash
cd batchflow
./mvnw spring-boot:run
# API → http://localhost:8080
# Swagger → http://localhost:8080/swagger-ui.html
```

### Key Endpoints

| Method | Path | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/institutions` | Public |
| POST | `/api/batches` | Institution, PM |
| POST | `/api/batches/{id}/assign-trainer` | Institution, PM |
| POST | `/api/batches/invites` | Institution, Trainer, PM |
| POST | `/api/batches/join` | Student, Trainer |
| POST | `/api/sessions` | Trainer |
| POST | `/api/attendance/mark` | Student |
| GET | `/api/batches/{id}/summary` | Institution, Trainer, PM, MO |

---

## Frontend — `frontend/`

**Stack:** React 19 · Vite · Redux Toolkit · React Router v7 · Tailwind CSS v4 · Axios

### Setup

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

### Student Invite Flow

1. Trainer goes to **Batch Invite** tab → generates link → `<origin>/join?token=xxx`
2. Student clicks link
   - Already logged in → joins immediately
   - Not logged in → token saved, redirected to login → joins after login
3. Student can also click **+ Join Batch** on dashboard and paste the token or link manually

---

## End-to-End Flow

```
Institution registers  →  Institution entity created
Trainer/Student registers  →  Selects institution from dropdown
Institution creates batch
Institution assigns trainer to batch
Trainer creates sessions  +  generates student invite links
Students join via invite link
Students mark attendance during sessions
Institution / PM / MO views summaries
```
