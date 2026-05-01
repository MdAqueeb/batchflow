import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { fetchCurrentUser } from '../store/slices/authSlice'
import { useAuth } from '../hooks/useAuth'
import { ROLE_DASHBOARD_ROUTES } from '../utils/rolePermissions'
import LoadingSpinner from './Common/LoadingSpinner'

export default function RoleGuard({ allowedRoles, children }) {
  const { user, loading, isAuthenticated } = useAuth()
  const dispatch = useDispatch()
  const navigate = useNavigate()

  // Reload user from backend on refresh (Redux is empty after page reload)
  useEffect(() => {
    if (isAuthenticated && !user && !loading) {
      dispatch(fetchCurrentUser())
    }
  }, [isAuthenticated, user, loading, dispatch])

  // Not authenticated → go to login
  if (!isAuthenticated) {
    navigate('/login', { replace: true })
    return null
  }

  // Still loading or fetching
  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Wrong role → redirect to own dashboard
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const ownRoute = ROLE_DASHBOARD_ROUTES[user.role]
    navigate(ownRoute || '/dashboard', { replace: true })
    return null
  }

  return children
}
