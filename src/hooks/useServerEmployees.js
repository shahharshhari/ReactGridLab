import { useCallback, useEffect, useRef, useState } from 'react'
import { fetchEmployees } from '../api/employees.js'

export function useServerEmployees({ pageSize: initialPageSize = 20, debounceMs = 350 } = {}) {
  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [sortBy, setSortBy] = useState('id')
  const [sortDir, setSortDir] = useState('asc')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const requestId = useRef(0)

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search)
      setPageIndex(0)
    }, debounceMs)
    return () => clearTimeout(t)
  }, [search, debounceMs])

  const load = useCallback(async () => {
    const id = ++requestId.current
    setLoading(true)
    setError(null)
    try {
      const result = await fetchEmployees({
        page: pageIndex,
        pageSize,
        sortBy,
        sortDir,
        search: debouncedSearch
      })
      if (id !== requestId.current) return
      setRows(result.rows)
      setTotal(result.total)
    } catch (err) {
      if (id !== requestId.current) return
      setError(err.message || 'Failed to load data')
      setRows([])
      setTotal(0)
    } finally {
      if (id === requestId.current) setLoading(false)
    }
  }, [pageIndex, pageSize, sortBy, sortDir, debouncedSearch])

  useEffect(() => {
    load()
  }, [load])

  const setSorting = useCallback((field, dir) => {
    setSortBy(field)
    setSortDir(dir)
    setPageIndex(0)
  }, [])

  const setPagination = useCallback((nextPageIndex, nextPageSize = pageSize) => {
    setPageIndex(nextPageIndex)
    if (nextPageSize !== pageSize) setPageSize(nextPageSize)
  }, [pageSize])

  return {
    rows,
    total,
    loading,
    error,
    pageIndex,
    pageSize,
    sortBy,
    sortDir,
    search,
    setSearch,
    setSorting,
    setPagination,
    setPageIndex,
    setPageSize,
    refetch: load
  }
}
