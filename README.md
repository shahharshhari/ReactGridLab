# React Grid POC

A side-by-side comparison of the four most popular **free / MIT-licensed** React grid libraries, all wired up with the same dataset and the same feature set, in a single app with a **Metronic-inspired** light theme.

## What's inside

| Page          | Library              | Notes                                            |
| ------------- | -------------------- | ------------------------------------------------ |
| `/ag-grid`    | AG Grid Community    | The industry standard. Tons of features.         |
| `/primereact` | PrimeReact DataTable | Most features free out of the box.               |
| `/mrt`        | Material React Table | TanStack v8 + MUI. Best DX if you're on MUI.     |
| `/mart`       | Mantine React Table  | TanStack v8 + Mantine. Lighter alternative.      |

Every page demonstrates:

- ✅ Sort, column filter, **global search**, pagination
- ✅ **Column resize, reorder (drag), hide/show**
- ✅ **Row selection** (single + multi via checkboxes)
- ✅ **Inline row editing**, **add row**, **delete row** (single + bulk)
- ✅ **Conditional row coloring** (VIP = yellow tint, Inactive = faded)
- ✅ **Export to CSV / Excel / PDF**
- ✅ **Import from CSV / XLSX**
- ✅ **Custom cell renderers** (status badges, performance bars, salary formatting)
- ✅ Sticky header, virtualization, pagination

## Quick start

```bash
npm install
npm run dev
```

Then open <http://localhost:5173>.

## Stack

- **Vite** + React 18
- **React Router** for the four grid pages
- **AG Grid Community**, **PrimeReact**, **Material React Table**, **Mantine React Table**
- **papaparse** (CSV), **xlsx** (Excel), **jspdf** + **jspdf-autotable** (PDF)
- **@faker-js/faker** for 80 deterministic dummy employees (same data on every page)

## Project structure

```
src/
├── main.jsx              # Entry; imports all grid CSS + theme CSS
├── App.jsx               # Router + MUI/Mantine providers
├── styles/global.css     # Metronic-inspired theme (sidebar, header, cards, buttons, badges)
├── layout/
│   ├── Layout.jsx        # Sidebar + Header + Outlet shell
│   ├── Sidebar.jsx       # Dark Metronic-style sidebar
│   └── Header.jsx        # Top bar with title + search + avatar
├── pages/
│   ├── Home.jsx          # Dashboard overview
│   ├── AgGridPage.jsx
│   ├── PrimeReactPage.jsx
│   ├── MRTPage.jsx
│   └── MaRTPage.jsx
├── data/employees.js     # 80 faker-generated employees (seeded)
└── utils/exportImport.js # CSV/Excel/PDF export + CSV/XLSX import helpers
```

## Notes on the Metronic theme

This isn't the official Metronic asset (which is paid). It's an **inspired** look-and-feel built with plain CSS:

- Dark sidebar (`#1e1e2d`), light content area (`#f5f8fa`)
- Card-based surfaces with soft shadows (`0 0 50px 0 rgba(82, 63, 105, 0.08)`)
- Indigo/blue primary (`#3e97ff`), success green (`#50cd89`), danger pink (`#f1416c`)
- Inter font, rounded corners, badge pills, breadcrumb pattern

If you have a Metronic license, you can drop the official SCSS in and replace `styles/global.css`.

## Features missing that you may want to add

- Master-detail / expandable rows
- Server-side data (lazy load on scroll / large datasets)
- Tree data / row grouping with aggregates
- Range selection + Excel-style copy/paste
- Undo/redo on edits
- State persistence (save column order/widths/filters to localStorage)
- Pinned (frozen) columns (PrimeReact and AG Grid support this natively)

The grid pages above already use **`renderRowActions`**, **`renderTopToolbarCustomActions`**, and conditional row styling — easy hooks for extending further.
