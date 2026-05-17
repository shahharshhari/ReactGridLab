import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Dashboard', icon: '🏠', end: true },
]

const gridItems = [
  { to: '/ag-grid', label: 'AG Grid', icon: '🅰️', badge: 'MIT' },
  { to: '/primereact', label: 'PrimeReact', icon: '🔷', badge: 'MIT' },
  { to: '/mrt', label: 'Material RT', icon: '🟦', badge: 'MIT' },
  { to: '/mart', label: 'Mantine RT', icon: '🟢', badge: 'MIT' }
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="sidebar-brand-mark">G</div>
        <div className="sidebar-brand-text">GridLab</div>
      </div>

      <div className="sidebar-section">Main</div>
      <ul className="sidebar-nav">
        {navItems.map((it) => (
          <li className="sidebar-nav-item" key={it.to}>
            <NavLink
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                'sidebar-nav-link' + (isActive ? ' active' : '')
              }
            >
              <span className="sidebar-nav-icon">{it.icon}</span>
              <span>{it.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>

      <div className="sidebar-section">Grid Libraries</div>
      <ul className="sidebar-nav">
        {gridItems.map((it) => (
          <li className="sidebar-nav-item" key={it.to}>
            <NavLink
              to={it.to}
              className={({ isActive }) =>
                'sidebar-nav-link' + (isActive ? ' active' : '')
              }
            >
              <span className="sidebar-nav-icon">{it.icon}</span>
              <span>{it.label}</span>
              {it.badge && <span className="sidebar-nav-badge">{it.badge}</span>}
            </NavLink>
          </li>
        ))}
      </ul>

      <div style={{ marginTop: 'auto', padding: '20px 25px', fontSize: 11, color: '#7e8299' }}>
        <div style={{ fontWeight: 600, color: '#fff', marginBottom: 4 }}>React Grid POC</div>
        v1.0 · Metronic style
      </div>
    </aside>
  )
}
