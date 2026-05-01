import api from './index'

/**
 * POST /api/attendance
 * Mark attendance for session
 */
export const markAttendance = (data) => api.post('/api/attendance', data)

/**
 * GET /api/attendance/session/{sessionId}
 * Get attendance records for a session
 */
export const getAttendanceBySession = (sessionId) =>
  api.get(`/api/attendance/session/${sessionId}`)
