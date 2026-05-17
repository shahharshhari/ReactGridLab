import { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import { AgGridReact } from 'ag-grid-react'
import { departments, roles, statuses, statusBadge } from '../data/employees.js'
import { fetchEmployees, createEmployee, removeEmployees } from '../api/employees.js'
import { exportCSV, exportExcel, exportPDF, importFromFile } from '../utils/exportImport.js'
import ServerModeBanner from '../components/ServerModeBanner.jsx'

const columnDefs = [
  {
    headerName: '',
    field: 'select',
    checkboxSelection: true,
    headerCheckboxSelection: true,
    width: 50,
    pinned: 'left',
    resizable: false,
    sortable: false,
    filter: false,
    editable: false,
    suppressMovable: true
  },
  { field: 'id', headerName: 'ID', width: 80, pinned: 'left', filter: 'agNumberColumnFilter', colId: 'id' },
  { field: 'name', headerName: 'Name', editable: true, filter: true, colId: 'name' },
  { field: 'email', headerName: 'Email', editable: true, filter: true, minWidth: 220, colId: 'email' },
  {
    field: 'department',
    headerName: 'Department',
    editable: true,
    filter: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: { values: departments },
    colId: 'department'
  },
  {
    field: 'role',
    headerName: 'Role',
    editable: true,
    filter: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: { values: roles },
    colId: 'role'
  },
  {
    field: 'salary',
    headerName: 'Salary',
    editable: true,
    filter: 'agNumberColumnFilter',
    valueFormatter: (p) => (p.value != null ? '$' + p.value.toLocaleString() : ''),
    colId: 'salary'
  },
  { field: 'joinDate', headerName: 'Join Date', editable: true, filter: 'agDateColumnFilter', colId: 'joinDate' },
  {
    field: 'status',
    headerName: 'Status',
    editable: true,
    filter: true,
    cellEditor: 'agSelectCellEditor',
    cellEditorParams: { values: statuses },
    cellRenderer: (p) => {
      const cls = 'badge badge-' + (statusBadge[p.value] || 'info')
      return `<span class="${cls}">${p.value || ''}</span>`
    },
    colId: 'status'
  },
  { field: 'country', headerName: 'Country', editable: true, filter: true, colId: 'country' },
  {
    field: 'performance',
    headerName: 'Performance',
    editable: true,
    filter: 'agNumberColumnFilter',
    cellRenderer: (p) => {
      const v = p.value || 0
      const color = v >= 85 ? '#50cd89' : v >= 70 ? '#3e97ff' : v >= 60 ? '#ffc700' : '#f1416c'
      return `<div style="display:flex;align-items:center;gap:8px">
        <div style="flex:1;height:6px;background:#f1f1f4;border-radius:3px;overflow:hidden">
          <div style="width:${v}%;height:100%;background:${color}"></div>
        </div>
        <span style="font-weight:600;font-size:12px;color:${color}">${v}</span>
      </div>`
    },
    colId: 'performance'
  },
  { field: 'phone', headerName: 'Phone', editable: true, colId: 'phone' },
  { field: 'city', headerName: 'City', editable: true, colId: 'city' }
]

const defaultColDef = {
  sortable: true,
  filter: true,
  resizable: true,
  floatingFilter: false,
  flex: 1,
  minWidth: 120,
  editable: false
}

const PAGE_SIZE = 20

export default function AgGridPage() {
  const gridRef = useRef(null)
  const fileInputRef = useRef(null)
  const searchRef = useRef('')
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedCount, setSelectedCount] = useState(0)

  useEffect(() => {
    const t = setTimeout(() => {
      searchRef.current = search
      gridRef.current?.api?.refreshInfiniteCache()
    }, 350)
    return () => clearTimeout(t)
  }, [search])

  const datasource = useMemo(
    () => ({
      getRows: async (params) => {
        setLoading(true)
        const pageSize = params.endRow - params.startRow || PAGE_SIZE
        const page = Math.floor(params.startRow / pageSize)
        let sortBy = 'id'
        let sortDir = 'asc'
        if (params.sortModel?.length) {
          sortBy = params.sortModel[0].colId || params.sortModel[0].field || 'id'
          sortDir = params.sortModel[0].sort || 'asc'
        }
        try {
          const result = await fetchEmployees({
            page,
            pageSize,
            sortBy,
            sortDir,
            search: searchRef.current
          })
          setTotal(result.total)
          params.successCallback(result.rows, result.total)
        } catch {
          params.failCallback()
        } finally {
          setLoading(false)
        }
      }
    }),
    []
  )

  const onGridReady = useCallback((e) => {
    e.api.setGridOption('datasource', datasource)
  }, [datasource])

  const getRowClass = useCallback((p) => {
    if (p.data?.status === 'VIP') return 'row-vip'
    if (p.data?.status === 'Inactive') return 'row-inactive'
    return ''
  }, [])

  const onSelectionChanged = useCallback(() => {
    setSelectedCount(gridRef.current?.api?.getSelectedRows().length || 0)
  }, [])

  const refreshGrid = () => gridRef.current?.api?.refreshInfiniteCache()

  const handleAdd = async () => {
    await createEmployee({
      name: 'New Employee',
      email: 'new@example.com',
      department: departments[0],
      role: roles[0],
      salary: 50000,
      joinDate: new Date().toISOString().slice(0, 10),
      status: 'Active',
      country: 'United States',
      performance: 75,
      phone: '',
      city: ''
    })
    refreshGrid()
  }

  const handleDelete = async () => {
    const ids = gridRef.current.api.getSelectedRows().map((r) => r.id)
    if (!ids.length) return alert('Select at least one row')
    await removeEmployees(ids)
    refreshGrid()
    setSelectedCount(0)
  }

  const visibleRows = () => {
    const rows = []
    gridRef.current?.api?.forEachNode((n) => n.data && rows.push(n.data))
    return rows
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importFromFile(file)
      alert('Import updates server store in a full app — refresh to see server data')
      refreshGrid()
    } catch (err) {
      alert('Import failed: ' + err.message)
    }
    e.target.value = ''
  }

  return (
    <>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home <span>›</span> Grids <span>›</span> AG Grid</div>
          <h1>AG Grid Community</h1>
          <p>Infinite row model — rows lazy-loaded from the server as you scroll and sort.</p>
        </div>
      </div>
      <ServerModeBanner total={total} loading={loading} />

      <div className="action-bar">
        <div className="global-search">
          <span className="global-search-icon">🔍</span>
          <input
            placeholder="Global search (server)…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <button className="btn btn-light" onClick={() => fileInputRef.current.click()}>📥 Import</button>
        <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleImport} />

        <button className="btn btn-light" onClick={() => exportCSV(visibleRows(), 'employees.csv')}>📄 CSV</button>
        <button className="btn btn-light" onClick={() => exportExcel(visibleRows(), 'employees.xlsx')}>📊 Excel</button>
        <button
          className="btn btn-light"
          onClick={() =>
            exportPDF(
              visibleRows(),
              'employees.pdf',
              [
                { header: 'ID', key: 'id' },
                { header: 'Name', key: 'name' },
                { header: 'Email', key: 'email' },
                { header: 'Department', key: 'department' },
                { header: 'Role', key: 'role' },
                { header: 'Salary', key: 'salary' },
                { header: 'Status', key: 'status' }
              ],
              'Employees — AG Grid'
            )
          }
        >
          📕 PDF
        </button>

        <div className="action-bar-spacer" />

        <button className="btn btn-danger btn-sm" disabled={!selectedCount} onClick={handleDelete}>
          🗑️ Delete ({selectedCount})
        </button>
        <button className="btn btn-primary btn-sm" onClick={handleAdd}>+ Add Row</button>
      </div>

      <div className={`grid-container${loading ? ' grid-loading' : ''}`}>
        <div className="ag-theme-quartz" style={{ height: 620, width: '100%' }}>
          <AgGridReact
            ref={gridRef}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            rowModelType="infinite"
            cacheBlockSize={PAGE_SIZE}
            maxBlocksInCache={5}
            infiniteInitialRowCount={PAGE_SIZE}
            rowSelection="multiple"
            suppressRowClickSelection
            animateRows
            getRowClass={getRowClass}
            onGridReady={onGridReady}
            onSelectionChanged={onSelectionChanged}
            stopEditingWhenCellsLoseFocus
          />
        </div>
      </div>
    </>
  )
}
