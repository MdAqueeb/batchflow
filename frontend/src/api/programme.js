import api from './index'

/**
 * GET /api/programme/summary
 * Get programme-wide summary (all institutions, batches, attendance metrics)
 * Optional filters: startDate, endDate
 */
export const getProgrammeSummary = (params) =>
  api.get('/api/programme/summary', { params })
