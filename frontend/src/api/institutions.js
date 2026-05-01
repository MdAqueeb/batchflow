import api from './index'

/**
 * GET /api/institutions
 * List all institutions (public — used for registration dropdown)
 */
export const getInstitutions = () => api.get('/api/institutions')

/**
 * GET /api/institutions/{id}/trainers
 * List trainers belonging to an institution (INSTITUTION/PM only)
 */
export const getInstitutionTrainers = (id) =>
  api.get(`/api/institutions/${id}/trainers`)

/**
 * GET /api/institutions/{id}/summary
 * Get institution summary (batches, trainers, attendance metrics)
 */
export const getInstitutionSummary = (id) =>
  api.get(`/api/institutions/${id}/summary`)
