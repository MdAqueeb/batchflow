import { useSelector } from 'react-redux'

export function useAuth() {
  const { user, loading, error, isAuthenticated } = useSelector((state) => state.auth)
  return { user, loading, error, isAuthenticated }
}
