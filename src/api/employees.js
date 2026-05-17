const BASE = '/api/employees'

export async function fetchEmployees({ page = 0, pageSize = 20, sortBy = 'id', sortDir = 'asc', search = '' } = {}) {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    sortBy,
    sortDir,
    search
  })
  const res = await fetch(`${BASE}?${params}`)
  if (!res.ok) throw new Error(`Failed to load employees (${res.status})`)
  return res.json()
}

export async function fetchEmployeeStats() {
  const res = await fetch(`${BASE}/stats`)
  if (!res.ok) throw new Error(`Failed to load stats (${res.status})`)
  return res.json()
}

export async function patchEmployee(id, data) {
  const res = await fetch(`${BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`Update failed (${res.status})`)
  return res.json()
}

export async function createEmployee(data) {
  const res = await fetch(BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  if (!res.ok) throw new Error(`Create failed (${res.status})`)
  return res.json()
}

export async function removeEmployees(ids) {
  const res = await fetch(BASE, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids })
  })
  if (!res.ok) throw new Error(`Delete failed (${res.status})`)
  return res.json()
}
