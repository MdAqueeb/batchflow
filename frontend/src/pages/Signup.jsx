import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { register as registerAPI } from '../api/auth'
import { getInstitutions } from '../api/institutions'
import { setAuth } from '../store/slices/authSlice'
import { ROLES } from '../utils/rolePermissions'
import Button from '../components/Common/Button'
import LoadingSpinner from '../components/Common/LoadingSpinner'

const ROLE_OPTIONS = Object.entries(ROLES).map(([key, value]) => ({
  label: key.replace(/_/g, ' '),
  value: value,
}))

const NEEDS_INSTITUTION_SELECT = ['TRAINER', 'STUDENT']
const NEEDS_INSTITUTION_NAME = ['INSTITUTION']

export default function Signup() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('')
  const [institutionName, setInstitutionName] = useState('')
  const [institutionId, setInstitutionId] = useState('')
  const [institutions, setInstitutions] = useState([])
  const [loadingInstitutions, setLoadingInstitutions] = useState(false)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState({})
  const navigate = useNavigate()
  const dispatch = useDispatch()

  useEffect(() => {
    if (NEEDS_INSTITUTION_SELECT.includes(role)) {
      setLoadingInstitutions(true)
      getInstitutions()
        .then((r) => {
          setInstitutions(r.data)
          setInstitutionId(r.data[0]?.id?.toString() || '')
        })
        .catch(() => toast.error('Failed to load institutions'))
        .finally(() => setLoadingInstitutions(false))
    } else {
      setInstitutions([])
      setInstitutionId('')
      setInstitutionName('')
    }
  }, [role])

  const validate = () => {
    const errs = {}
    if (!name) errs.name = 'Name is required'
    if (!email) errs.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Invalid email format'
    if (!password) errs.password = 'Password is required'
    else if (password.length < 6) errs.password = 'Password must be at least 6 characters'
    if (!role) errs.role = 'Role is required'
    if (NEEDS_INSTITUTION_NAME.includes(role) && !institutionName.trim()) {
      errs.institutionName = 'Institution name is required'
    }
    if (NEEDS_INSTITUTION_SELECT.includes(role) && !institutionId) {
      errs.institutionId = 'Please select an institution'
    }
    return errs
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }

    const payload = { name, email, password, role }
    if (NEEDS_INSTITUTION_NAME.includes(role)) payload.institutionName = institutionName.trim()
    if (NEEDS_INSTITUTION_SELECT.includes(role)) payload.institutionId = Number(institutionId)

    setLoading(true)
    setErrors({})
    try {
      const response = await registerAPI(payload)
      const { token, user } = response.data
      localStorage.setItem('token', token)
      dispatch(setAuth({ user, token }))
      toast.success('Account created successfully!')
      navigate('/login')
    } catch (error) {
      const message = error.response?.data?.message || 'Signup failed'
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = (field) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
      errors[field] ? 'border-red-500' : 'border-gray-300'
    }`

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-blue-700 tracking-tight">BatchFlow</h1>
        <p className="text-gray-500 text-sm mt-1">Create your account</p>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Sign Up</h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputCls('name')}
              placeholder="John Doe"
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputCls('email')}
              placeholder="you@example.com"
            />
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={inputCls('password')}
              placeholder="••••••••"
            />
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={role}
              onChange={(e) => { setRole(e.target.value); setErrors({}) }}
              className={inputCls('role')}
            >
              <option value="">-- Select a role --</option>
              {ROLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            {errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
          </div>

          {/* INSTITUTION: enter new institution name */}
          {NEEDS_INSTITUTION_NAME.includes(role) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name</label>
              <input
                type="text"
                value={institutionName}
                onChange={(e) => setInstitutionName(e.target.value)}
                className={inputCls('institutionName')}
                placeholder="e.g. City Training Centre"
              />
              {errors.institutionName && (
                <p className="text-red-500 text-xs mt-1">{errors.institutionName}</p>
              )}
            </div>
          )}

          {/* TRAINER / STUDENT: pick existing institution */}
          {NEEDS_INSTITUTION_SELECT.includes(role) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
              {loadingInstitutions ? (
                <div className="py-2"><LoadingSpinner size="sm" /></div>
              ) : institutions.length === 0 ? (
                <p className="text-sm text-red-500">No institutions registered yet.</p>
              ) : (
                <select
                  value={institutionId}
                  onChange={(e) => setInstitutionId(e.target.value)}
                  className={inputCls('institutionId')}
                >
                  {institutions.map((inst) => (
                    <option key={inst.id} value={inst.id}>
                      {inst.name}
                    </option>
                  ))}
                </select>
              )}
              {errors.institutionId && (
                <p className="text-red-500 text-xs mt-1">{errors.institutionId}</p>
              )}
            </div>
          )}

          <Button type="submit" disabled={loading} className="w-full mt-6">
            {loading ? <LoadingSpinner size="sm" /> : 'Create Account'}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 font-medium">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
