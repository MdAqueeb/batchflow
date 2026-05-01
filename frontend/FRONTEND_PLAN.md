# Frontend Development Plan

**Project**: Frontend Management System  
**Timeline**: 3 days  
**Tech Stack**: React 18, React Router v6, Redux Toolkit, TailwindCSS, Axios  
**Target**: Scalable, modular, role-based access control

---

## Architecture Overview

```
Frontend (Vercel)
├── Auth Layer (Clerk integration)
├── Redux Store (user role, auth state)
├── Role-based Routing
└── Feature Modules (per role)
    ├── Student Dashboard
    ├── Trainer Dashboard
    ├── Institution Dashboard
    ├── Programme Manager Dashboard
    └── Monitoring Officer Dashboard
```

---

## Phase 1: Project Setup & Core Infrastructure (Day 1 - 4 hours)

### Tasks
- [ ] Initialize React project with Vite (faster than CRA)
- [ ] Configure TailwindCSS + PostCSS
- [ ] Setup React Router v6 with lazy code-splitting
- [ ] Integrate Clerk authentication
- [ ] Setup Redux Toolkit for state management
  - User slice (role, auth status, institution_id)
  - Batch slice
  - Session slice
  - Attendance slice
- [ ] Create API client (Axios with interceptors for auth token)
- [ ] Setup folder structure:
  ```
  src/
  ├── components/
  │   ├── Auth/
  │   ├── Common/
  │   ├── Layout/
  │   └── RoleGuard.jsx
  ├── pages/
  │   ├── Login.jsx
  │   ├── Dashboard.jsx
  │   └── roles/
  ├── store/
  │   ├── slices/
  │   └── hooks.js
  ├── services/
  │   └── api.js
  ├── hooks/
  │   └── useAuth.js
  ├── utils/
  │   └── rolePermissions.js
  └── App.jsx
  ```

### Deliverables
- [ ] App loads and Clerk login works
- [ ] Token stored securely (httpOnly cookie preferred)
- [ ] Redux devtools integrated for debugging

---

## Phase 2: Authentication & Role-Based Routing (Day 1 - 4 hours)

### Tasks
- [ ] Create `RoleGuard` component that wraps protected routes
  - Verify role server-side after login
  - Redirect to appropriate dashboard
  - Handle 403 responses from API
- [ ] Create login/signup flow
  - Role selector on signup (Student, Trainer, Institution, Programme Manager, Monitoring Officer)
  - Post-signup, redirect to role setup or dashboard
- [ ] Setup role permission matrix:
  ```javascript
  const ROLE_PERMISSIONS = {
    STUDENT: ['view_sessions', 'mark_attendance'],
    TRAINER: ['create_session', 'view_batch_attendance', 'generate_invite'],
    INSTITUTION: ['view_batches', 'view_trainers', 'view_batch_summary'],
    PROGRAMME_MANAGER: ['view_institution_summary'],
    MONITORING_OFFICER: ['view_programme_summary']
  };
  ```
- [ ] Create custom hooks:
  - `useAuth()` - returns current user, loading state, logout
  - `useCanAccess(permission)` - check if user has permission
  - `useRole()` - returns current role

### Deliverables
- [ ] All 5 roles can sign up and log in
- [ ] Dashboard routes are protected (403 on invalid access)
- [ ] Clerk user ID stored in Redux

---

## Phase 3: Shared Components & Layout (Day 1 - 2 hours)

### Tasks
- [ ] Create base components:
  - `Header` (with user name, role badge, logout)
  - `Sidebar` (role-specific nav links)
  - `DashboardLayout` (wrapper for all role dashboards)
  - `LoadingSpinner` & `ErrorBoundary`
  - `Card`, `Button`, `Modal`, `Table` (reusable UI)
  - `EmptyState` (for no data scenarios)
- [ ] Setup TailwindCSS utilities:
  - Color scheme (primary, secondary, danger)
  - Responsive breakpoints
  - Custom component classes

### Deliverables
- [ ] Consistent UI across all views
- [ ] Mobile-responsive layout
- [ ] Dark mode support (optional, TailwindCSS built-in)

---

## Phase 4: Role-Specific Dashboards (Day 2 - Full Day)

### 4.1 Student Dashboard
**Time: 4 hours**

- [ ] **View Active Sessions**
  - Fetch from GET `/sessions` (filtered by student's batches)
  - Display: session title, date, time, batch name
  - Table or card layout
  - Upcoming sessions only (date > today)
  
- [ ] **Mark Attendance**
  - Open session in modal/drawer
  - Show attendance status options: Present, Absent, Late
  - POST `/attendance/mark` with session_id, status
  - Confirmation toast on success
  - Validation: only allow marking if session is active (time-based check)

- [ ] **Join Batch via Invite Link**
  - Parse `?invite_code=xxx` from URL
  - POST `/batches/:id/join` with invite code
  - Auto-redirect to dashboard on success

---

### 4.2 Trainer Dashboard
**Time: 5 hours**

- [ ] **Create Session**
  - Form fields: title, date, start_time, end_time, batch (dropdown)
  - Fetch batches from Redux (populated on login)
  - POST `/sessions`
  - Toast notification on success
  - Clear form and show in list immediately

- [ ] **View Sessions & Attendance**
  - List all trainer's sessions
  - Click session → modal with full attendance table
  - Show each student + status
  - Download CSV option (optional, Phase 2)
  - GET `/sessions/:id/attendance`

- [ ] **Generate & Share Batch Invite Link**
  - Dropdown to select batch
  - POST `/batches/:id/invite`
  - Return invite code + full link: `{baseURL}?invite_code={code}`
  - Copy-to-clipboard button
  - Display QR code of link (use `qrcode.react` package)

- [ ] **Manage Batches**
  - List all batches assigned to trainer
  - View students in each batch
  - View summary stats (total students, attendance %)

---

### 4.3 Institution Dashboard
**Time: 5 hours**

- [ ] **View All Batches**
  - Fetch from GET `/batches` filtered by institution_id
  - Show: batch name, trainer count, student count, creation date
  - Search/filter by batch name

- [ ] **View All Trainers**
  - Fetch from GET `/batches/:id/trainers` (or custom endpoint)
  - Show trainer name, batches assigned, active sessions count

- [ ] **Batch Attendance Summary**
  - Click batch → GET `/batches/:id/summary`
  - Display metrics:
    - Total students, total sessions
    - Attendance rate (%), trend over time
  - Table: session date, attendance count, rate
  - Line chart (optional): attendance trend over last 30 days

- [ ] **Institution Overview**
  - Summary card: total trainers, batches, students
  - High-level attendance metrics

---

### 4.4 Programme Manager Dashboard
**Time: 4 hours**

- [ ] **View All Institutions**
  - Fetch from GET `/institutions`
  - Show: institution name, trainer count, batch count, student count

- [ ] **Institution-Level Summary**
  - Click institution → GET `/institutions/:id/summary`
  - Display:
    - All batches under institution + attendance rates
    - All trainers + their session counts
  - Drill-down capability

- [ ] **Programme-Wide Summary**
  - GET `/programme/summary`
  - Metrics:
    - Total students, trainers, institutions
    - Overall attendance rate
    - Attendance by institution (table + bar chart)
  - Filter by date range (start_date, end_date params)

---

### 4.5 Monitoring Officer Dashboard
**Time: 3 hours**

- [ ] **Read-Only Programme Dashboard**
  - GET `/programme/summary`
  - Show same data as Programme Manager but no edit/create buttons
  - Display:
    - Overall attendance metrics
    - Attendance by institution (table + pie chart)
    - Top/bottom performing institutions
    - Attendance trend over time (line chart)

- [ ] **Export Data** (optional)
  - Download attendance summary as CSV
  - Filter by date range, institution

---

## Phase 5: Data Integration & State Management (Day 2 - 2 hours)

### Tasks
- [ ] Setup Redux Toolkit slices:
  - **authSlice**: user, role, loading, error
  - **batchSlice**: batches, selectedBatch, loading
  - **sessionSlice**: sessions, loading
  - **attendanceSlice**: attendanceRecords, loading
  
- [ ] Create async thunks for API calls:
  ```javascript
  // Example
  export const fetchSessions = createAsyncThunk(
    'sessions/fetchSessions',
    async (_, { rejectWithValue }) => {
      try {
        const res = await api.get('/sessions');
        return res.data;
      } catch (err) {
        return rejectWithValue(err.response.data);
      }
    }
  );
  ```

- [ ] Fetch data on component mount:
  - Use custom hooks to trigger thunks
  - Handle loading/error states
  - Cache data to avoid redundant calls

- [ ] Form validation:
  - Client-side validation for all forms
  - Display validation errors under fields
  - Disable submit button until valid

### Deliverables
- [ ] Redux state is single source of truth
- [ ] No hardcoded data visible in UI
- [ ] All views fetch from API endpoints

---

## Phase 6: Testing & Error Handling (Day 3 - 3 hours)

### Tasks
- [ ] Test each role's golden path:
  - [ ] Student: login → view sessions → mark attendance
  - [ ] Trainer: login → create session → view attendance → generate invite link
  - [ ] Institution: login → view batches → view batch summary
  - [ ] Programme Manager: login → view institution summaries
  - [ ] Monitoring Officer: login → view programme dashboard

- [ ] Error handling:
  - 401 (Unauthorized): redirect to login
  - 403 (Forbidden): show "Access Denied" message
  - 500 (Server Error): show error toast, log to console
  - Network timeout: retry button or auto-retry

- [ ] Edge cases:
  - Empty states (no sessions, no batches, etc.)
  - Expired sessions (re-auth via Clerk)
  - Slow network (loading skeletons)
  - Browser back button (maintain state)

### Deliverables
- [ ] All routes functional and tested
- [ ] Error messages clear and actionable
- [ ] Graceful degradation for missing data

---

## Phase 7: Performance & Optimization (Day 3 - 2 hours)

### Tasks
- [ ] Code splitting:
  - Lazy load role-specific dashboards
  - Use `React.lazy()` + `Suspense`
  
- [ ] Image optimization:
  - Use `next/image` equivalent or Vercel Image Optimization
  - Compress assets

- [ ] Bundle analysis:
  - Run `vite build --analyze` or similar
  - Remove unused dependencies
  - Tree-shake unused code

- [ ] Performance monitoring:
  - Web Vitals via Vercel Analytics
  - Error tracking (Sentry optional)

### Deliverables
- [ ] Page load < 3s on 4G
- [ ] Lighthouse score > 80
- [ ] No console errors/warnings

---

## Phase 8: Deployment to Vercel (Day 3 - 1 hour)

### Tasks
- [ ] Connect GitHub repo to Vercel
- [ ] Set environment variables:
  ```
  REACT_APP_API_BASE_URL=<backend_url>
  REACT_APP_CLERK_PUBLISHABLE_KEY=<clerk_key>
  ```
- [ ] Deploy main branch
- [ ] Test live deployment with all 5 roles
- [ ] Verify API calls work from Vercel domain

### Deliverables
- [ ] Live frontend URL in README
- [ ] All features working on production

---

## Parallel Work Strategy

**Day 1**:
- Team A: Phase 1 (Setup) + Phase 2 (Auth)
- Team B: Phase 3 (Shared Components) in parallel

**Day 2**:
- Phase 4: Build dashboards in parallel (one dev per role)
- Phase 5: Redux setup can happen in parallel

**Day 3**:
- Phase 6: Testing (all roles)
- Phase 7: Optimization
- Phase 8: Deployment

---

## Technology Justification

| Layer | Choice | Why |
|-------|--------|-----|
| **Framework** | React 18 + Vite | Fast HMR, smaller bundles, modern features |
| **Routing** | React Router v6 | Standard, lazy loading support, nested routes |
| **State** | Redux Toolkit | Scalable, middleware support, devtools |
| **Styling** | TailwindCSS | Utility-first, consistent design, low CSS overhead |
| **Charts** | Recharts / Chart.js | React-native, responsive, lightweight |
| **HTTP** | Axios | Interceptors for auth, timeout handling |
| **Auth** | Clerk | Backend integration, OAuth, session mgmt built-in |
| **Deployment** | Vercel | Optimal for React, auto-preview deploys, Edge Functions |

---

## File Structure (Final)

```
src/
├── components/
│   ├── Auth/
│   │   ├── LoginForm.jsx
│   │   ├── SignupForm.jsx
│   │   └── RoleSelector.jsx
│   ├── Common/
│   │   ├── Header.jsx
│   │   ├── Sidebar.jsx
│   │   ├── LoadingSpinner.jsx
│   │   ├── ErrorBoundary.jsx
│   │   └── Button.jsx, Card.jsx, Modal.jsx, Table.jsx
│   ├── Layout/
│   │   └── DashboardLayout.jsx
│   └── RoleGuard.jsx
├── pages/
│   ├── Login.jsx
│   ├── NotFound.jsx
│   └── roles/
│       ├── StudentDashboard.jsx
│       ├── TrainerDashboard.jsx
│       ├── InstitutionDashboard.jsx
│       ├── ProgrammeManagerDashboard.jsx
│       └── MonitoringOfficerDashboard.jsx
├── store/
│   ├── slices/
│   │   ├── authSlice.js
│   │   ├── batchSlice.js
│   │   ├── sessionSlice.js
│   │   └── attendanceSlice.js
│   └── store.js
├── services/
│   └── api.js
├── hooks/
│   ├── useAuth.js
│   ├── useCanAccess.js
│   ├── useRole.js
│   └── useFetch.js
├── utils/
│   ├── rolePermissions.js
│   ├── formatters.js
│   └── validators.js
├── App.jsx
├── main.jsx
└── index.css

public/
├── index.html
└── favicon.ico
```

---

## Success Criteria

✅ All 5 roles can sign up, log in, and access their dashboard  
✅ Each role sees only permitted UI elements  
✅ Real data from API displayed (not hardcoded)  
✅ Deployed live on Vercel  
✅ Responsive on mobile + desktop  
✅ No console errors  
✅ README with live URL + test accounts  

---

## Risks & Mitigations

| Risk | Mitigation |
|------|-----------|
| Backend not ready | Mock API responses locally; use `msw` (Mock Service Worker) |
| Auth integration issues | Test Clerk setup early; use Clerk docs preview |
| Performance | Use Lighthouse; lazy load dashboards; optimize images |
| Time crunch | Focus on 3 roles first; extend if time allows |
| Deployment failure | Test locally with `npm run preview` before pushing |

---

## Notes

- Use AI (Cursor/Copilot) for boilerplate generation but review all code
- Commit frequently with clear messages
- Write honest README documenting what works and what doesn't
- Partial working > claiming complete but broken
- Focus on user experience and real data flow over pixel-perfect design
