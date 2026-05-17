import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { MantineProvider, createTheme as createMantineTheme } from '@mantine/core'

import Layout from './layout/Layout.jsx'
import PageLoader from './components/PageLoader.jsx'

const Home = lazy(() => import('./pages/Home.jsx'))
const AgGridPage = lazy(() => import('./pages/AgGridPage.jsx'))
const PrimeReactPage = lazy(() => import('./pages/PrimeReactPage.jsx'))
const MRTPage = lazy(() => import('./pages/MRTPage.jsx'))
const MaRTPage = lazy(() => import('./pages/MaRTPage.jsx'))

const muiTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#3e97ff' },
    secondary: { main: '#7239ea' },
    background: { default: '#f5f8fa', paper: '#ffffff' }
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
    button: { textTransform: 'none', fontWeight: 600 }
  },
  shape: { borderRadius: 8 }
})

const mantineTheme = createMantineTheme({
  primaryColor: 'indigo',
  fontFamily: 'Inter, system-ui, sans-serif',
  defaultRadius: 'md'
})

export default function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <MantineProvider theme={mantineTheme}>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Home />} />
              <Route path="ag-grid" element={<AgGridPage />} />
              <Route path="primereact" element={<PrimeReactPage />} />
              <Route path="mrt" element={<MRTPage />} />
              <Route path="mart" element={<MaRTPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </Suspense>
      </MantineProvider>
    </ThemeProvider>
  )
}
