import { useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { fetchCurrentUser } from '../store/slices/authSlice'
import { useAuth } from '../hooks/useAuth'
import { ROLE_DASHBOARD_ROUTES } from '../utils/rolePermissions'
import LoadingSpinner from '../components/Common/LoadingSpinner'

export default function Dashboard() {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, loading, isAuthenticated } = useAuth()
  const fetched = useRef(false)

  useEffect(() => {
    if (!isAuthenticated) { navigate('/login', { replace: true }); return }
    if (fetched.current) return
    fetched.current = true
    dispatch(fetchCurrentUser())
  }, [isAuthenticated, dispatch, navigate])

  useEffect(() => {
    if (user?.role) {
      const route = ROLE_DASHBOARD_ROUTES[user.role]
      if (route) navigate(route, { replace: true })
    }
  }, [user, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <LoadingSpinner size="lg" />
    </div>
  )
}
