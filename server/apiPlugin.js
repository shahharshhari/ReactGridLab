import {
  queryEmployees,
  getEmployeeStats,
  updateEmployee,
  deleteEmployees,
  addEmployee
} from './employeeStore.js'

function parseQuery(url) {
  const params = new URL(url, 'http://localhost').searchParams
  return {
    page: Math.max(0, parseInt(params.get('page') || '0', 10)),
    pageSize: Math.min(100, Math.max(1, parseInt(params.get('pageSize') || '20', 10))),
    sortBy: params.get('sortBy') || 'id',
    sortDir: params.get('sortDir') || 'asc',
    search: params.get('search') || ''
  }
}

function sendJson(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = ''
    req.on('data', (chunk) => {
      data += chunk
    })
    req.on('end', () => {
      try {
        resolve(data ? JSON.parse(data) : {})
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

function apiMiddleware() {
  return async (req, res, next) => {
        const url = req.url || ''

        if (url === '/api/employees/stats' && req.method === 'GET') {
          return sendJson(res, 200, getEmployeeStats())
        }

        if (url.startsWith('/api/employees') && req.method === 'GET') {
          return sendJson(res, 200, queryEmployees(parseQuery(url)))
        }

        if (url === '/api/employees' && req.method === 'POST') {
          try {
            const body = await readBody(req)
            return sendJson(res, 201, addEmployee(body))
          } catch {
            return sendJson(res, 400, { error: 'Invalid JSON' })
          }
        }

        if (url.startsWith('/api/employees/') && req.method === 'PATCH') {
          const id = parseInt(url.split('/').pop(), 10)
          try {
            const body = await readBody(req)
            const updated = updateEmployee(id, body)
            if (!updated) return sendJson(res, 404, { error: 'Not found' })
            return sendJson(res, 200, updated)
          } catch {
            return sendJson(res, 400, { error: 'Invalid JSON' })
          }
        }

        if (url.startsWith('/api/employees?') && req.method === 'DELETE') {
          const ids = new URL(url, 'http://localhost').searchParams.get('ids')
          if (!ids) return sendJson(res, 400, { error: 'ids required' })
          const removed = deleteEmployees(ids.split(','))
          return sendJson(res, 200, { removed })
        }

        if (url === '/api/employees' && req.method === 'DELETE') {
          try {
            const body = await readBody(req)
            const removed = deleteEmployees(body.ids || [])
            return sendJson(res, 200, { removed })
          } catch {
            return sendJson(res, 400, { error: 'Invalid JSON' })
          }
        }

        next()
      }
}

export function apiPlugin() {
  return {
    name: 'employee-api',
    configureServer(server) {
      server.middlewares.use(apiMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(apiMiddleware())
    }
  }
}
