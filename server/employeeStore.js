import { faker } from '@faker-js/faker'

faker.seed(42)

const departments = ['Engineering', 'Sales', 'Marketing', 'HR', 'Finance', 'Design', 'Support']
const roles = ['Manager', 'Senior', 'Junior', 'Lead', 'Director', 'Intern']
const statuses = ['Active', 'On Leave', 'Inactive', 'VIP']

const TOTAL = 5000

function makeEmployees(count) {
  return Array.from({ length: count }, (_, i) => {
    const firstName = faker.person.firstName()
    const lastName = faker.person.lastName()
    return {
      id: i + 1,
      name: `${firstName} ${lastName}`,
      email: faker.internet.email({ firstName, lastName }).toLowerCase(),
      department: faker.helpers.arrayElement(departments),
      role: faker.helpers.arrayElement(roles),
      salary: faker.number.int({ min: 35000, max: 180000 }),
      joinDate: faker.date.past({ years: 8 }).toISOString().slice(0, 10),
      status: faker.helpers.arrayElement(statuses),
      country: faker.location.country(),
      performance: faker.number.int({ min: 50, max: 100 }),
      phone: faker.phone.number(),
      city: faker.location.city()
    }
  })
}

const employees = makeEmployees(TOTAL)

function compare(a, b, field, dir) {
  const av = a[field]
  const bv = b[field]
  if (av == null && bv == null) return 0
  if (av == null) return 1
  if (bv == null) return -1
  if (typeof av === 'number' && typeof bv === 'number') {
    return dir === 'asc' ? av - bv : bv - av
  }
  const sa = String(av).toLowerCase()
  const sb = String(bv).toLowerCase()
  if (sa < sb) return dir === 'asc' ? -1 : 1
  if (sa > sb) return dir === 'asc' ? 1 : -1
  return 0
}

function matchesSearch(row, search) {
  if (!search) return true
  const q = search.toLowerCase()
  return ['name', 'email', 'department', 'role', 'country', 'city', 'status', 'phone'].some(
    (f) => String(row[f] ?? '').toLowerCase().includes(q)
  )
}

export function queryEmployees({
  page = 0,
  pageSize = 20,
  sortBy = 'id',
  sortDir = 'asc',
  search = ''
} = {}) {
  let filtered = employees.filter((row) => matchesSearch(row, search))

  const field = sortBy || 'id'
  const dir = sortDir === 'desc' ? 'desc' : 'asc'
  filtered = [...filtered].sort((a, b) => compare(a, b, field, dir))

  const total = filtered.length
  const start = page * pageSize
  const rows = filtered.slice(start, start + pageSize)

  return { rows, total, page, pageSize }
}

export function getEmployeeStats() {
  const active = employees.filter((e) => e.status === 'Active').length
  const vip = employees.filter((e) => e.status === 'VIP').length
  const avgSalary = Math.round(employees.reduce((s, e) => s + e.salary, 0) / employees.length)
  return { total: employees.length, active, vip, avgSalary }
}

export function updateEmployee(id, patch) {
  const idx = employees.findIndex((e) => e.id === id)
  if (idx === -1) return null
  employees[idx] = { ...employees[idx], ...patch, id }
  return employees[idx]
}

export function deleteEmployees(ids) {
  const idSet = new Set(ids.map(Number))
  let removed = 0
  for (let i = employees.length - 1; i >= 0; i--) {
    if (idSet.has(employees[i].id)) {
      employees.splice(i, 1)
      removed++
    }
  }
  return removed
}

export function addEmployee(row) {
  const nextId = employees.length ? Math.max(...employees.map((e) => e.id)) + 1 : 1
  const created = { ...row, id: nextId }
  employees.unshift(created)
  return created
}

export { departments, roles, statuses, TOTAL }
