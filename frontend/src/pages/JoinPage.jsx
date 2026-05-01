import { useEffect, useRef } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { joinBatch } from '../api/batches'
import { fetchCurrentUser } from '../store/slices/authSlice'
import { fetchBatches } from '../store/slices/batchSlice'
import { useAuth } from '../hooks/useAuth'
import LoadingSpinner from '../components/Common/LoadingSpinner'

export const PENDING_JOIN_TOKEN_KEY = 'pendingJoinToken'

export default function JoinPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { user, loading, isAuthenticated } = useAuth()
  const attempted = useRef(false)

  const token = searchParams.get('token')

  useEffect(() => {
    if (!token) {
      navigate('/dashboard', { replace: true })
      return
    }
    if (!isAuthenticated) {
      sessionStorage.setItem(PENDING_JOIN_TOKEN_KEY, token)
      navigate('/login', { replace: true })
      return
    }
    if (isAuthenticated && !user && !loading) {
      dispatch(fetchCurrentUser())
    }
  }, [token, isAuthenticated, user, loading, dispatch, navigate])

  useEffect(() => {
    if (!token || !isAuthenticated || loading || !user || attempted.current) return
    if (user.role !== 'STUDENT') {
      toast.error('Only students can join via invite link')
      navigate('/dashboard', { replace: true })
      return
    }
    attempted.current = true
    joinBatch(token)
      .then(() => {
        toast.success('Joined batch!')
        dispatch(fetchBatches())
      })
      .catch((e) => {
        toast.error(e.response?.data?.message || 'Failed to join batch')
      })
      .finally(() => {
        navigate('/dashboard/student', { replace: true })
      })
  }, [token, isAuthenticated, user, loading, dispatch, navigate])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-3">
      <LoadingSpinner size="lg" />
      <p className="text-sm text-gray-500">Joining batch…</p>
    </div>
  )
}
