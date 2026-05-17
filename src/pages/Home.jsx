import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchEmployeeStats } from '../api/employees.js'

const gridCards = [
  {
    to: '/ag-grid',
    name: 'AG Grid Community',
    tag: 'Industry Standard',
    icon: '🅰️',
    color: '#3e97ff',
    desc: 'Infinite row model with server-side lazy loading. Sort and filter hit the API.'
  },
  {
    to: '/primereact',
    name: 'PrimeReact DataTable',
    tag: 'Most Features Free',
    icon: '🔷',
    color: '#7239ea',
    desc: 'Built-in lazy mode — pages, sorts, and filters are loaded from the server on demand.'
  },
  {
    to: '/mrt',
    name: 'Material React Table',
    tag: 'Best DX (MUI)',
    icon: '🟦',
    color: '#50cd89',
    desc: 'Manual server-side pagination with TanStack Table. Only the current page is fetched.'
  },
  {
    to: '/mart',
    name: 'Mantine React Table',
    tag: 'Best DX (Mantine)',
    icon: '🟢',
    color: '#f1416c',
    desc: 'Same server pagination pattern as MRT, with Mantine UI components.'
  }
]

export default function Home() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    fetchEmployeeStats()
      .then(setStats)
      .catch(() => setStats({ total: 0, active: 0, vip: 0, avgSalary: 0 }))
  }, [])

  const total = stats?.total ?? '—'
  const active = stats?.active ?? '—'
  const vip = stats?.vip ?? '—'
  const avgSalary = stats?.avgSalary

  return (
    <>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home <span>›</span> Dashboard</div>
          <h1>React Grid POC</h1>
          <p>
            Compare AG Grid, PrimeReact, MRT, and MaRT — each loads{' '}
            <strong>5,000 employees</strong> from a mock API with server-side pagination and lazy route loading.
          </p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#eef6ff', color: '#3e97ff' }}>👥</div>
          <div className="stat-card-value">{total}</div>
          <div className="stat-card-label">Total Employees</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#e8fff3', color: '#50cd89' }}>✓</div>
          <div className="stat-card-value">{active}</div>
          <div className="stat-card-label">Active</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#f8f5ff', color: '#7239ea' }}>⭐</div>
          <div className="stat-card-value">{vip}</div>
          <div className="stat-card-label">VIP</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-icon" style={{ background: '#fff8dd', color: '#a37e00' }}>💰</div>
          <div className="stat-card-value">
            {avgSalary != null ? `$${(avgSalary / 1000).toFixed(0)}k` : '—'}
          </div>
          <div className="stat-card-label">Avg. Salary</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Pick a grid to explore</h2>
            <div className="card-subtitle">All four use the same REST API with server-side pagination</div>
          </div>
        </div>
        <div className="card-body">
          <div className="feature-grid">
            {gridCards.map((g) => (
              <Link
                key={g.to}
                to={g.to}
                className="feature-card"
                style={{ borderTop: `3px solid ${g.color}` }}
              >
                <div style={{ fontSize: 32 }}>{g.icon}</div>
                <h3>{g.name}</h3>
                <p>{g.desc}</p>
                <span className="feature-tag" style={{ background: g.color + '22', color: g.color }}>
                  {g.tag}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div>
            <h2 className="card-title">Server-side data & lazy loading</h2>
            <div className="card-subtitle">
              Sort · filter · search · pagination · resize · reorder · selection · edit · export · import
            </div>
          </div>
        </div>
        <div className="card-body" style={{ color: 'var(--m-text-secondary)', lineHeight: 1.7, fontSize: 13.5 }}>
          Each grid page fetches only the <strong>current page</strong> from{' '}
          <code>/api/employees</code> (5,000 rows on the server). Global search is debounced and sent to the API.
          Grid routes are <strong>lazy-loaded</strong> with React <code>Suspense</code> so each library bundle loads on demand.
          AG Grid uses the <strong>infinite row model</strong>; PrimeReact uses <strong>lazy</strong> mode; MRT and MaRT use{' '}
          <strong>manual pagination</strong>.
        </div>
      </div>
    </>
  )
}
