import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Toaster } from 'react-hot-toast'
import { store } from './store/store'
import { ROLES } from './utils/rolePermissions'
import RoleGuard from './components/RoleGuard'
import LoadingSpinner from './components/Common/LoadingSpinner'

const Login = lazy(() => import('./pages/Login'))
const Signup = lazy(() => import('./pages/Signup'))
const SelectRole = lazy(() => import('./pages/SelectRole'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const StudentDashboard = lazy(() => import('./pages/roles/StudentDashboard'))
const TrainerDashboard = lazy(() => import('./pages/roles/TrainerDashboard'))
const InstitutionDashboard = lazy(() => import('./pages/roles/InstitutionDashboard'))
const ProgrammeManagerDashboard = lazy(() => import('./pages/roles/ProgrammeManagerDashboard'))
const MonitoringOfficerDashboard = lazy(() => import('./pages/roles/MonitoringOfficerDashboard'))
const NotFound = lazy(() => import('./pages/NotFound'))
const JoinPage = lazy(() => import('./pages/JoinPage'))

const fallback = (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
)

function AppRoutes() {
  return (
    <BrowserRouter>
      <Suspense fallback={fallback}>
        <Routes>
          {/* Public auth routes */}
          <Route path="/login"       element={<Login />} />
          <Route path="/signup"      element={<Signup />} />
          <Route path="/select-role" element={<SelectRole />} />
          <Route path="/join"        element={<JoinPage />} />

          {/* Smart redirect: reads role from backend → sends to correct dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />

          {/* Role-locked dashboards */}
          <Route path="/dashboard/student" element={
            <RoleGuard allowedRoles={[ROLES.STUDENT]}><StudentDashboard /></RoleGuard>
          } />
          <Route path="/dashboard/trainer" element={
            <RoleGuard allowedRoles={[ROLES.TRAINER]}><TrainerDashboard /></RoleGuard>
          } />
          <Route path="/dashboard/institution" element={
            <RoleGuard allowedRoles={[ROLES.INSTITUTION]}><InstitutionDashboard /></RoleGuard>
          } />
          <Route path="/dashboard/programme-manager" element={
            <RoleGuard allowedRoles={[ROLES.PROGRAMME_MANAGER]}><ProgrammeManagerDashboard /></RoleGuard>
          } />
          <Route path="/dashboard/monitoring-officer" element={
            <RoleGuard allowedRoles={[ROLES.MONITORING_OFFICER]}><MonitoringOfficerDashboard /></RoleGuard>
          } />

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
      <Toaster position="top-right" />
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  )
}
