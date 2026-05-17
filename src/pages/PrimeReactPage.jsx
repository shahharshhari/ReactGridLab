import { useRef, useState, useCallback, useEffect } from 'react'
import { DataTable } from 'primereact/datatable'
import { Column } from 'primereact/column'
import { InputText } from 'primereact/inputtext'
import { Dropdown } from 'primereact/dropdown'
import { InputNumber } from 'primereact/inputnumber'
import { Toast } from 'primereact/toast'
import { departments, roles, statuses, statusBadge } from '../data/employees.js'
import { fetchEmployees, createEmployee, removeEmployees, patchEmployee } from '../api/employees.js'
import { exportCSV, exportExcel, exportPDF, importFromFile } from '../utils/exportImport.js'
import ServerModeBanner from '../components/ServerModeBanner.jsx'

const PAGE_SIZE = 20

export default function PrimeReactPage() {
  const toast = useRef(null)
  const fileInputRef = useRef(null)
  const dtRef = useRef(null)

  const [rows, setRows] = useState([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)
  const [globalFilter, setGlobalFilter] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [lazyParams, setLazyParams] = useState({
    first: 0,
    rows: PAGE_SIZE,
    sortField: 'id',
    sortOrder: 1
  })

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(globalFilter), 350)
    return () => clearTimeout(t)
  }, [globalFilter])

  const loadData = useCallback(async (params) => {
    setLoading(true)
    const page = Math.floor((params.first ?? 0) / (params.rows ?? PAGE_SIZE))
    const sortDir = params.sortOrder === -1 ? 'desc' : 'asc'
    try {
      const result = await fetchEmployees({
        page,
        pageSize: params.rows ?? PAGE_SIZE,
        sortBy: params.sortField || 'id',
        sortDir,
        search: debouncedSearch
      })
      setRows(result.rows)
      setTotal(result.total)
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Load failed', detail: err.message })
    } finally {
      setLoading(false)
    }
  }, [debouncedSearch])

  useEffect(() => {
    setLazyParams((p) => ({ ...p, first: 0 }))
  }, [debouncedSearch])

  useEffect(() => {
    loadData(lazyParams)
  }, [lazyParams, loadData])

  const onLazyLoad = (e) => {
    setLazyParams({
      first: e.first,
      rows: e.rows,
      sortField: e.sortField || lazyParams.sortField,
      sortOrder: e.sortOrder ?? lazyParams.sortOrder
    })
  }

  const textEditor = (options) => (
    <InputText type="text" value={options.value} onChange={(ev) => options.editorCallback(ev.target.value)} />
  )
  const numberEditor = (options) => (
    <InputNumber value={options.value} onValueChange={(ev) => options.editorCallback(ev.value)} />
  )
  const dropdownEditor = (list) => (options) => (
    <Dropdown value={options.value} options={list} onChange={(ev) => options.editorCallback(ev.value)} placeholder="Select" />
  )

  const onRowEditComplete = async (e) => {
    try {
      await patchEmployee(e.newData.id, e.newData)
      loadData(lazyParams)
      toast.current?.show({ severity: 'success', summary: 'Saved', detail: 'Row updated on server' })
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Save failed', detail: err.message })
    }
  }

  const salaryBody = (r) => '$' + (r.salary || 0).toLocaleString()
  const statusBody = (r) => (
    <span className={'badge badge-' + (statusBadge[r.status] || 'info')}>{r.status}</span>
  )
  const performanceBody = (r) => {
    const v = r.performance || 0
    const color = v >= 85 ? '#50cd89' : v >= 70 ? '#3e97ff' : v >= 60 ? '#ffc700' : '#f1416c'
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ flex: 1, height: 6, background: '#f1f1f4', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{ width: `${v}%`, height: '100%', background: color }} />
        </div>
        <span style={{ fontWeight: 600, fontSize: 12, color }}>{v}</span>
      </div>
    )
  }

  const rowClass = (r) => ({
    'row-vip': r.status === 'VIP',
    'row-inactive': r.status === 'Inactive'
  })

  const handleAdd = async () => {
    try {
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
      loadData(lazyParams)
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Add failed', detail: err.message })
    }
  }

  const handleDeleteSelected = async () => {
    if (!selected?.length) {
      toast.current?.show({ severity: 'warn', summary: 'Nothing selected', detail: 'Pick at least one row.' })
      return
    }
    try {
      await removeEmployees(selected.map((r) => r.id))
      setSelected([])
      loadData(lazyParams)
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Delete failed', detail: err.message })
    }
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importFromFile(file)
      toast.current?.show({ severity: 'info', summary: 'Imported', detail: 'Refresh — server holds canonical data' })
      loadData(lazyParams)
    } catch (err) {
      toast.current?.show({ severity: 'error', summary: 'Import failed', detail: err.message })
    }
    e.target.value = ''
  }

  return (
    <>
      <Toast ref={toast} position="top-right" />
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home <span>›</span> Grids <span>›</span> PrimeReact</div>
          <h1>PrimeReact DataTable</h1>
          <p>Lazy mode — each page, sort, and search request is handled by the server API.</p>
        </div>
      </div>
      <ServerModeBanner total={total} loading={loading} />

      <div className="action-bar">
        <div className="global-search">
          <span className="global-search-icon">🔍</span>
          <input placeholder="Global search (server)…" value={globalFilter} onChange={(e) => setGlobalFilter(e.target.value)} />
        </div>
        <button className="btn btn-light" onClick={() => fileInputRef.current.click()}>📥 Import</button>
        <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleImport} />
        <button className="btn btn-light" onClick={() => exportCSV(rows, 'employees.csv')}>📄 CSV</button>
        <button className="btn btn-light" onClick={() => exportExcel(rows, 'employees.xlsx')}>📊 Excel</button>
        <button className="btn btn-light" onClick={() => exportPDF(rows, 'employees.pdf', [{ header: 'Name', key: 'name' }], 'Employees')}>📕 PDF</button>
        <div className="action-bar-spacer" />
        <button className="btn btn-danger btn-sm" onClick={handleDeleteSelected}>🗑️ Delete ({selected?.length || 0})</button>
        <button className="btn btn-primary btn-sm" onClick={handleAdd}>+ Add Row</button>
      </div>

      <div className="grid-container">
        <DataTable
          ref={dtRef}
          value={rows}
          lazy
          paginator
          first={lazyParams.first}
          rows={lazyParams.rows}
          rowsPerPageOptions={[10, 20, 50]}
          totalRecords={total}
          onPage={onLazyLoad}
          onSort={onLazyLoad}
          loading={loading}
          dataKey="id"
          selectionMode="checkbox"
          selection={selected}
          onSelectionChange={(e) => setSelected(e.value)}
          globalFilterFields={['name', 'email', 'department', 'role', 'country', 'city', 'status']}
          editMode="row"
          onRowEditComplete={onRowEditComplete}
          resizableColumns
          reorderableColumns
          columnResizeMode="expand"
          rowClassName={rowClass}
          stripedRows
          removableSort
          scrollable
          scrollHeight="560px"
          emptyMessage="No employees found"
          sortField={lazyParams.sortField}
          sortOrder={lazyParams.sortOrder}
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }} />
          <Column field="id" header="ID" sortable style={{ minWidth: '5rem' }} />
          <Column field="name" header="Name" sortable editor={textEditor} style={{ minWidth: '10rem' }} />
          <Column field="email" header="Email" sortable editor={textEditor} style={{ minWidth: '14rem' }} />
          <Column field="department" header="Department" sortable editor={dropdownEditor(departments)} style={{ minWidth: '10rem' }} />
          <Column field="role" header="Role" sortable editor={dropdownEditor(roles)} style={{ minWidth: '8rem' }} />
          <Column field="salary" header="Salary" sortable body={salaryBody} editor={numberEditor} style={{ minWidth: '7rem' }} />
          <Column field="joinDate" header="Join Date" sortable editor={textEditor} style={{ minWidth: '8rem' }} />
          <Column field="status" header="Status" sortable body={statusBody} editor={dropdownEditor(statuses)} style={{ minWidth: '7rem' }} />
          <Column field="country" header="Country" sortable editor={textEditor} style={{ minWidth: '8rem' }} />
          <Column field="performance" header="Performance" sortable body={performanceBody} editor={numberEditor} style={{ minWidth: '10rem' }} />
          <Column rowEditor headerStyle={{ width: '6rem' }} bodyStyle={{ textAlign: 'center' }} />
        </DataTable>
      </div>
    </>
  )
}
