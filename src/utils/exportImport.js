import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

/** Export rows array to CSV file */
export function exportCSV(rows, filename = 'data.csv') {
  const csv = Papa.unparse(rows)
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  triggerDownload(blob, filename)
}

/** Export rows array to XLSX file */
export function exportExcel(rows, filename = 'data.xlsx', sheetName = 'Sheet1') {
  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)
  XLSX.writeFile(wb, filename)
}

/**
 * Export rows array to PDF file.
 * @param rows  array of objects
 * @param columns optional [{header, key}] — defaults to first row keys
 */
export function exportPDF(rows, filename = 'data.pdf', columns = null, title = 'Export') {
  const doc = new jsPDF({ orientation: 'landscape' })
  const cols = columns || Object.keys(rows[0] || {}).map((k) => ({ header: k, key: k }))
  const head = [cols.map((c) => c.header)]
  const body = rows.map((r) => cols.map((c) => r[c.key] ?? ''))

  doc.setFontSize(14)
  doc.text(title, 14, 15)
  doc.autoTable({
    head,
    body,
    startY: 22,
    styles: { fontSize: 8, cellPadding: 3 },
    headStyles: { fillColor: [62, 151, 255], textColor: 255, fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [249, 250, 252] }
  })
  doc.save(filename)
}

/** Parse a user-selected file and resolve with the rows. Supports CSV + XLSX. */
export function importFromFile(file) {
  return new Promise((resolve, reject) => {
    if (!file) return reject(new Error('No file'))
    const ext = file.name.split('.').pop().toLowerCase()

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (res) => resolve(res.data),
        error: reject
      })
      return
    }

    if (ext === 'xlsx' || ext === 'xls') {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const wb = XLSX.read(e.target.result, { type: 'array' })
          const ws = wb.Sheets[wb.SheetNames[0]]
          resolve(XLSX.utils.sheet_to_json(ws))
        } catch (err) {
          reject(err)
        }
      }
      reader.onerror = reject
      reader.readAsArrayBuffer(file)
      return
    }

    reject(new Error(`Unsupported file type: ${ext}`))
  })
}

function triggerDownload(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
