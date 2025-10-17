import http from 'http'
import { readFileSync, existsSync, createReadStream } from 'fs'
import { extname, join } from 'path'

const PORT = process.env.PORT || 5173
const root = process.cwd()
const distDir = join(root, 'dist')
const indexHtmlPath = join(distDir, 'index.html')
// Base path used by built assets when Vite base is set (e.g. '/intervu/')
const BASE_PATH = (process.env.BASE_PATH || '/intervu/').replace(/\/+$/, '/')

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2'
}

function serveStatic(filePath, res) {
  const ext = extname(filePath)
  const contentType = mimeTypes[ext] || 'application/octet-stream'
  res.setHeader('Content-Type', contentType)
  createReadStream(filePath).pipe(res)
}

const server = http.createServer((req, res) => {
  const fullPath = decodeURI((req.url || '').split('?')[0] || '/')
  const urlPath = fullPath.startsWith(BASE_PATH)
    ? fullPath.slice(BASE_PATH.length - (BASE_PATH.endsWith('/') ? 1 : 0))
    : fullPath
  const relativePath = urlPath.replace(/^\/+/, '')
  const filePath = join(distDir, relativePath)
  if (relativePath && existsSync(filePath)) {
    return serveStatic(filePath, res)
  }
  const fallback = existsSync(indexHtmlPath)
    ? readFileSync(indexHtmlPath)
    : Buffer.from('Build not found', 'utf-8')
  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.end(fallback)
})

server.listen(PORT, () => {
  console.log(`Server listening on http://0.0.0.0:${PORT}`)
})


