import api from './index'

/**
 * POST /api/sessions
 * Create new session
 */
export const createSession = (data) => api.post('/api/sessions', data)

/**
 * GET /api/sessions
 * List all sessions (filtered by batch/trainer)
 */
export const getSessions = () => api.get('/api/sessions')

/**
 * GET /api/sessions/{id}
 * Get session details with attendance records
 */
export const getSessionById = (id) => api.get(`/api/sessions/${id}`)
