import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { login as loginAPI } from '../api/auth'
import { setAuth } from '../store/slices/authSlice'
import { PENDING_JOIN_TOKEN_KEY } from './JoinPage'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const validate = () => {
    const newErrors = {}

    if (!email) newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = 'Invalid email format'

    if (!password) newErrors.password = 'Password is required'

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const newErrors = validate()

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setLoading(true)
    setErrors({})

    try {
      const response = await loginAPI(email, password)

      const { token, user } = response.data

      localStorage.setItem('token', token)
      dispatch(setAuth({ user, token }))

      toast.success('Login successful!')
      const pendingToken = sessionStorage.getItem(PENDING_JOIN_TOKEN_KEY)
      if (pendingToken && user.role === 'STUDENT') {
        sessionStorage.removeItem(PENDING_JOIN_TOKEN_KEY)
        navigate(`/join?token=${pendingToken}`)
      } else {
        navigate('/dashboard')
      }

    } catch (error) {
      const message =
        error.response?.data?.message || 'Login failed'

      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4">

      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-700">
          BatchFlow
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Attendance Management System
        </p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">

        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Sign In
        </h2>

        {/* <form onSubmit={handleSubmit} className="space-y-4"> */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="you@example.com"
            />

            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg ${
                errors.password ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="••••••••"
            />

            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password}
              </p>
            )}
          </div>

          <button
            // type="submit"
            onClick={(e) => {handleSubmit(e)}}
            disabled={loading}
            className="w-full mt-6 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>

        {/* </form> */}

        {/* SIGNUP */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Don't have an account?{' '}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign up
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}