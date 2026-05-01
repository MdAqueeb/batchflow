import api from './index'

/**
 * POST /api/batches
 * Create new batch
 */
export const createBatch = (data) => api.post('/api/batches', data)

/**
 * GET /api/batches
 * List all batches (filtered by institution/role)
 */
export const getBatches = () => api.get('/api/batches')

/**
 * GET /api/batches/{id}
 * Get batch details
 */
export const getBatchById = (id) => api.get(`/api/batches/${id}`)

/**
 * GET /api/batches/{id}/summary
 * Get batch attendance summary
 */
export const getBatchSummary = (id) =>
  api.get(`/api/batches/${id}/summary`)

/**
 * POST /api/batches/invites
 * Generate batch invite link
 */
export const createBatchInvite = (batchId) =>
  api.post('/api/batches/invites', { batchId })

/**
 * POST /api/batches/join
 * Join batch with invite token
 */
export const joinBatch = (token) =>
  api.post('/api/batches/join', { token })

/**
 * POST /api/batches/{batchId}/assign-trainer
 * Directly assign a trainer to a batch (INSTITUTION/PM only)
 */
export const assignTrainer = (batchId, trainerId) =>
  api.post(`/api/batches/${batchId}/assign-trainer`, { trainerId })
