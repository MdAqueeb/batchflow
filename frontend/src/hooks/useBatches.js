import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchBatches } from '../store/slices/batchSlice'

/**
 * Returns batches from Redux store.
 * Fetches from backend only when the store is empty (cache-first).
 */
export function useBatches() {
  const dispatch = useDispatch()
  const { list, loading, error } = useSelector((s) => s.batches)

  useEffect(() => {
    if (list.length === 0 && !loading) {
      dispatch(fetchBatches())
    }
  }, []) // eslint-disable-line

  return { batches: list, loading, error }
}
