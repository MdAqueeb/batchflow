import api from './index'

/**
 * GET /api/users/me
 * Get current authenticated user
 */
export const getCurrentUser = () => api.get('/api/users/me')
