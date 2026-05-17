import { useMemo, useRef, useState } from 'react'
import { MantineReactTable, useMantineReactTable } from 'mantine-react-table'
import { ActionIcon, Button, Tooltip, Badge, Group, Progress, Text, TextInput } from '@mantine/core'
import { IconEdit, IconTrash } from '@tabler/icons-react'
import { departments, roles, statuses, statusBadge } from '../data/employees.js'
import { createEmployee, removeEmployees, patchEmployee } from '../api/employees.js'
import { exportCSV, exportExcel, exportPDF, importFromFile } from '../utils/exportImport.js'
import { useServerEmployees } from '../hooks/useServerEmployees.js'
import ServerModeBanner from '../components/ServerModeBanner.jsx'

const badgeColor = {
  success: 'teal',
  warning: 'yellow',
  danger: 'red',
  info: 'grape'
}

export default function MaRTPage() {
  const fileInputRef = useRef(null)
  const [rowSelection, setRowSelection] = useState({})
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
        mantineEditSelectProps: { data: departments },
        size: 140
      },
      {
        accessorKey: 'role',
        header: 'Role',
        editVariant: 'select',
        mantineEditSelectProps: { data: roles },
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
        mantineEditSelectProps: { data: statuses },
        size: 110,
        Cell: ({ cell }) => {
          const v = cell.getValue()
          return (
            <Badge color={badgeColor[statusBadge[v]] || 'gray'} variant="light" radius="xl">
              {v}
            </Badge>
          )
        }
      },
      { accessorKey: 'country', header: 'Country', size: 130 },
      {
        accessorKey: 'performance',
        header: 'Performance',
        size: 160,
        Cell: ({ cell }) => {
          const v = cell.getValue() || 0
          const color = v >= 85 ? 'teal' : v >= 70 ? 'blue' : v >= 60 ? 'yellow' : 'red'
          return (
            <Group gap="xs" wrap="nowrap">
              <Progress value={v} color={color} size="sm" radius="xl" style={{ flex: 1 }} />
              <Text size="xs" fw={600} c={color}>{v}</Text>
            </Group>
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

  const handleBulkDelete = async (table) => {
    const ids = table.getSelectedRowModel().rows.map((r) => r.original.id)
    if (!ids.length) return alert('Select at least one row')
    await removeEmployees(ids)
    setRowSelection({})
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

  const table = useMantineReactTable({
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
      rowSelection,
      isLoading: loading,
      pagination: { pageIndex, pageSize },
      sorting: [{ id: sortBy, desc: sortDir === 'desc' }],
      showAlertBanner: !!error
    },
    onRowSelectionChange: setRowSelection,
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
    mantineToolbarAlertBannerProps: error ? { color: 'red', children: error } : undefined,
    getRowId: (row) => String(row.id),
    mantineTableBodyRowProps: ({ row }) => {
      const s = row.original.status
      return {
        style: {
          backgroundColor: s === 'VIP' ? '#fff8dd' : s === 'Inactive' ? '#fafafa' : undefined,
          opacity: s === 'Inactive' ? 0.7 : 1
        }
      }
    },
    renderRowActions: ({ row, table: t }) => (
      <Group gap={4} wrap="nowrap">
        <Tooltip label="Edit">
          <ActionIcon variant="subtle" onClick={() => t.setEditingRow(row)}>
            <IconEdit size={16} />
          </ActionIcon>
        </Tooltip>
        <Tooltip label="Delete">
          <ActionIcon variant="subtle" color="red" onClick={() => handleDelete(row.original.id)}>
            <IconTrash size={16} />
          </ActionIcon>
        </Tooltip>
      </Group>
    ),
    renderTopToolbarCustomActions: ({ table: t }) => (
      <Group gap="xs" wrap="wrap">
        <TextInput
          size="xs"
          placeholder="Search server…"
          value={search}
          onChange={(e) => setSearch(e.currentTarget.value)}
          style={{ minWidth: 180 }}
        />
        <Button size="xs" variant="default" onClick={() => fileInputRef.current.click()}>📥 Import</Button>
        <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" style={{ display: 'none' }} onChange={handleImport} />
        <Button size="xs" variant="default" onClick={() => exportCSV(rows, 'employees.csv')}>📄 CSV</Button>
        <Button size="xs" variant="default" onClick={() => exportExcel(rows, 'employees.xlsx')}>📊 Excel</Button>
        <Button size="xs" variant="default" onClick={() => exportPDF(rows, 'employees.pdf', columns.map((c) => ({ header: c.header, key: c.accessorKey })), 'Employees — Mantine RT')}>📕 PDF</Button>
        <Button size="xs" color="red" onClick={() => handleBulkDelete(t)}>🗑️ Delete Selected</Button>
        <Button size="xs" color="indigo" onClick={handleAdd}>+ Add Row</Button>
      </Group>
    )
  })

  return (
    <>
      <div className="page-header">
        <div>
          <div className="breadcrumb">Home <span>›</span> Grids <span>›</span> Mantine RT</div>
          <h1>Mantine React Table</h1>
          <p>Manual server-side pagination with Mantine UI — {pageSize} rows per API request.</p>
        </div>
      </div>
      <ServerModeBanner total={total} loading={loading} />
      <div className="grid-container table-wrap">
        <MantineReactTable table={table} />
      </div>
    </>
  )
}
