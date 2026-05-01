import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useAuth } from '../../hooks/useAuth'
import { clearAuth } from '../../store/slices/authSlice'
import { ROLE_LABELS, ROLE_COLORS } from '../../utils/rolePermissions'
import Sidebar from './Sidebar'
import ErrorBoundary from '../Common/ErrorBoundary'

export default function DashboardLayout({ children }) {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user } = useAuth()

  function handleLogout() {
    dispatch(clearAuth())
    navigate('/login', { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex flex-col flex-1 min-w-0">
        {/* Header */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between shrink-0">
          <span className="text-lg font-bold text-blue-700 tracking-tight">Batchflow</span>

          <div className="flex items-center gap-3">
            {user && (
              <>
                <span className="text-sm text-gray-600 hidden sm:block">{user.name}</span>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${ROLE_COLORS[user.role]}`}>
                  {ROLE_LABELS[user.role]}
                </span>
              </>
            )}
            <button
              onClick={handleLogout}
              className="text-sm text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
            >
              Logout
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 px-6 py-6 max-w-7xl w-full mx-auto">
          <ErrorBoundary>
            {children}
          </ErrorBoundary>
        </main>
      </div>
    </div>
  )
}
