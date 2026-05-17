import { useLocation } from 'react-router-dom'

const titles = {
  '/': { title: 'Dashboard', subtitle: 'Overview of all grid libraries' },
  '/ag-grid': { title: 'AG Grid Community', subtitle: 'High-performance grid · MIT licensed' },
  '/primereact': { title: 'PrimeReact DataTable', subtitle: 'Feature-rich free grid · MIT licensed' },
  '/mrt': { title: 'Material React Table', subtitle: 'TanStack + MUI · MIT licensed' },
  '/mart': { title: 'Mantine React Table', subtitle: 'TanStack + Mantine · MIT licensed' }
}

export default function Header() {
  const { pathname } = useLocation()
  const { title, subtitle } = titles[pathname] || titles['/']

  return (
    <header className="header">
      <div>
        <h1 className="header-title">{title}</h1>
        <div className="header-subtitle">{subtitle}</div>
      </div>
      <div className="header-spacer" />
      <div className="header-search">
        <span className="header-search-icon">🔍</span>
        <input placeholder="Quick search…" />
      </div>
      <div className="header-avatar">JD</div>
    </header>
  )
}
