import api from './index'

/**
 * POST /api/auth/register
 * Register new user with name, email, password, role
 */
export const register = (data) => api.post('/api/auth/register', data)

/**
 * POST /api/auth/login
 * Login with email and password
 */
export const login = (email, password) =>
  api.post('/api/auth/login', { email, password })
