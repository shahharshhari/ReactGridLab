import { useMemo, useRef } from 'react'
import { MaterialReactTable, useMaterialReactTable } from 'material-react-table'
import { Box, Button, IconButton, Tooltip, Chip, TextField } from '@mui/material'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import { departments, roles, statuses, statusBadge } from '../data/employees.js'
import { createEmployee, removeEmployees, patchEmployee } from '../api/employees.js'
import { exportCSV, exportExcel, exportPDF, importFromFile } from '../utils/exportImport.js'
import { useServerEmployees } from '../hooks/useServerEmployees.js'
import ServerModeBanner from '../components/ServerModeBanner.jsx'

const badgeColor = {
  success: '#50cd89',
  warning: '#ffc700',
  danger: '#f1416c',
  info: '#7239ea'
}

export default function MRTPage() {
  const fileInputRef = useRef(null)
  const {
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
    refetch
  } = useServerEmployees({ pageSize: 20 })

  const columns = useMemo(
    () => [
      { accessorKey: 'id', header: 'ID', size: 70, enableEditing: false },
      { accessorKey: 'name', header: 'Name', size: 160 },
      { accessorKey: 'email', header: 'Email', size: 220 },
      {
        accessorKey: 'department',
        header: 'Department',
        editVariant: 'select',
        editSelectOptions: departments,
        size: 140
      },
      {
        accessorKey: 'role',
        header: 'Role',
        editVariant: 'select',
        editSelectOptions: roles,
        size: 120
      },
      {
        accessorKey: 'salary',
        header: 'Salary',
        size: 110,
        Cell: ({ cell }) => '$' + (cell.getValue() || 0).toLocaleString()
      },
      { accessorKey: 'joinDate', header: 'Join Date', size: 120 },
      {
        accessorKey: 'status',
        header: 'Status',
        editVariant: 'select',
        editSelectOptions: statuses,
        size: 110,
        Cell: ({ cell }) => {
          const v = cell.getValue()
          const c = badgeColor[statusBadge[v]] || '#7239ea'
          return <Chip size="small" label={v} sx={{ bgcolor: c + '22', color: c, fontWeight: 600, height: 22 }} />
        }
      },
      { accessorKey: 'country', header: 'Country', size: 130 },
      {
        accessorKey: 'performance',
        header: 'Performance',
        size: 140,
        Cell: ({ cell }) => {
          const v = cell.getValue() || 0
          const c = v >= 85 ? '#50cd89' : v >= 70 ? '#3e97ff' : v >= 60 ? '#ffc700' : '#f1416c'
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ flex: 1, height: 6, bgcolor: '#f1f1f4', borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ width: `${v}%`, height: '100%', bgcolor: c }} />
              </Box>
              <Box sx={{ fontWeight: 600, fontSize: 12, color: c }}>{v}</Box>
            </Box>
          )
        }
      },
      { accessorKey: 'phone', header: 'Phone', size: 140 },
      { accessorKey: 'city', header: 'City', size: 130 }
    ],
    []
  )

  const handleSaveRow = async ({ row, values, table }) => {
    await patchEmployee(row.original.id, values)
    table.setEditingRow(null)
    refetch()
  }

  const handleDelete = async (id) => {
    await removeEmployees([id])
    refetch()
  }

  const handleBulkDelete = async (rowSelection, table) => {
    const ids = table.getSelectedRowModel().rows.map((r) => r.original.id)
    if (!ids.length) return alert('Select at least one row')
    await removeEmployees(ids)
    table.resetRowSelection()
    refetch()
  }

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
    refetch()
  }

  const handleImport = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      await importFromFile(file)
      refetch()
    } catch (err) {
      alert('Import failed: ' + err.message)
    }
    e.target.value = ''
  }

  const table = useMaterialReactTable({
    columns,
    data: rows,
    manualPagination: true,
    manualSorting: true,
    rowCount: total,
    enableRowSelection: true,
    enableColumnOrdering: true,
    enableColumnResizing: true,
    enableColumnDragging: true,
    enableGlobalFilter: false,
    enableColumnFilters: true,
    enableSorting: true,
    enablePagination: true,
    enableStickyHeader: true,
    enableEditing: true,
    editDisplayMode: 'row',
    onEditingRowSave: handleSaveRow,
    state: {
      isLoading: loading,
      pagination: { pageIndex, pageSize },
      sorting: [{ id: sortBy, desc: sortDir === 'desc' }],
      showAlertBanner: !!error
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater({ pageIndex, pageSize }) : updater
      setPagination(next.pageIndex, next.pageSize)
    },
    onSortingChange: (updater) => {
      const current = [{ id: sortBy, desc: sortDir === 'desc' }]
      const next = typeof updater === 'function' ? updater(current) : updater
      const s = next[0]
      if (s) setSorting(s.id, s.desc ? 'desc' : 'asc')
    },
    muiToolbarAlertBannerProps: error ? { color: 'error', children: error } : undefined,
    muiTableBodyRowProps: ({ row }) => {
      const s = row.original.status
      return {
        sx: {
          bgcolor: s === 'VIP' ? '#fff8dd' : s === 'Inactive' ? '#fafafa' : undefined,
          opacity: s === 'Inactive' ? 0.7 : 1
        }
      }
    },
    renderRowActions: ({ row, table: t }) => (
      <Box sx={{ display: 'flex', gap: 0.5 }}>
        <Tooltip title="Edit">
          <IconButton size="small" onClick={() => t.setEditingRow(row)}>
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton size="small" color="error" onClick={() => handleDelete(row.original.id)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table: t }) => (
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
        <TextField
          size="small"
          placeholder="Search server…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: 200 }}
        />
        <Button size="small" variant="outlined" onClick={() => fileInputRef.current.click()}>📥 Import</Button>
        <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleImport} />
        <Button size="small" variant="outlined" onClick={() => exportCSV(rows, 'employees.csv')}>📄 CSV</Button>
        <Button size="small" variant="outlined" onClick={() => exportExcel(rows, 'employees.xlsx')}>📊 Excel</Button>
        <Button size="small" variant="outlined" onClick={() => exportPDF(rows, 'employees.pdf', columns.map((c) => ({ header: c.header, key: c.accessorKey })), 'Employees')}>📕 PDF</Button>
        <Button size="small" color="error" variant="contained" onClick={() => handleBulkDelete({}, t)}>🗑️ Delete Selected</Button>
        <Button size="small" color="primary" variant="contained" onClick={handleAdd}>+ Add Row</Button>
      </Box>
    )
  })

  return (
    <>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home <span>›</span> Grids <span>›</span> Material RT</div>
          <h1>Material React Table</h1>
          <p>Manual server-side pagination — only {pageSize} rows loaded per page from the API.</p>
        </div>
      </div>
      <ServerModeBanner total={total} loading={loading} />
      <div className="grid-container table-wrap">
        <MaterialReactTable table={table} />
      </div>
    </>
  )
}
