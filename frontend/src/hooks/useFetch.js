import { useState, useEffect, useCallback, useRef } from 'react'
import api from '../api'

/**
 * Generic data-fetch hook.
 * @param {string|null} url  - API path. Pass null to skip initial fetch.
 * @param {object} opts
 *   params   – query params object
 *   skip     – if true, don't fetch on mount
 *   deps     – extra dependency array values that trigger re-fetch
 */
export function useFetch(url, { params, skip = false, deps = [] } = {}) {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(!skip && !!url)
  const [error, setError] = useState(null)
  const abortRef = useRef(null)

  const run = useCallback(() => {
    if (!url || skip) return
    // Cancel previous in-flight request
    if (abortRef.current) abortRef.current.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setLoading(true)
    setError(null)

    api.get(url, { params, signal: controller.signal })
      .then((r) => { setData(r.data); setLoading(false) })
      .catch((e) => {
        if (e.name === 'CanceledError' || e.code === 'ERR_CANCELED') return
        setError(e.response?.data?.message || 'Request failed')
        setLoading(false)
      })
  }, [url, JSON.stringify(params), skip, ...deps]) // eslint-disable-line

  useEffect(() => { run() }, [run])

  return { data, loading, error, refetch: run }
}
