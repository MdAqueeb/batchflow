import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function SelectRole() {
  const navigate = useNavigate()

  useEffect(() => {
    // Redirect to signup since role selection is now part of the signup form
    navigate('/signup', { replace: true })
  }, [navigate])

  return null
}
