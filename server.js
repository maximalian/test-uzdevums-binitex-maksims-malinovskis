import express from 'express'
import cors from 'cors'
import axios from 'axios'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// CORS is a browser rule that blocks JS from calling another host/port/protocol unless
// the target sets Access-Control-Allow-Origin headers. The ECDC API lacks those headers,
// so we proxy requests server-side (Node is not blocked by CORS) and add permissive headers.

const app = express()
const PORT = Number(process.env.PORT || 3000)
const API_PREFIX = '/api/ecdc'
const TARGET_ORIGIN = 'https://opendata.ecdc.europa.eu'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const distDir = path.join(__dirname, 'dist')

// Allow any origin; tighten if you need a specific domain.
app.use(cors({ origin: '*', methods: ['GET', 'HEAD', 'OPTIONS'] }))

// Proxy /api/ecdc/* -> https://opendata.ecdc.europa.eu/*
app.use(API_PREFIX, async (req, res) => {
  // Strip the API prefix so `/api/ecdc/foo` becomes `/foo` upstream.
  const upstreamPath = req.originalUrl.replace(new RegExp(`^${API_PREFIX}`), '') || '/'
  const upstreamUrl = new URL(upstreamPath, TARGET_ORIGIN).toString()

  try {
    const upstream = await axios.get(upstreamUrl, {
      validateStatus: () => true, // we pass through status codes
      headers: Object.fromEntries(
        Object.entries(req.headers).filter(([key]) => key.toLowerCase() !== 'host'),
      ),
      responseType: 'json',
    })

    if (upstream.status >= 200 && upstream.status < 300) {
      res.status(upstream.status).json(upstream.data)
      return
    }

    res.status(upstream.status).json({
      error: 'Upstream request failed',
      status: upstream.status,
      details: upstream.data ?? upstream.statusText,
    })
  } catch (error) {
    console.error('Proxy error:', error)
    res.status(502).json({ error: 'Failed to reach upstream ECDC API' })
  }
})

// Serve built frontend (optional helper for production hosting)
app.use(express.static(distDir))
app.get('*', (_req, res) => {
  res.sendFile(path.join(distDir, 'index.html'))
})

app.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`)
  console.log(`Forwarding ${API_PREFIX} -> ${TARGET_ORIGIN}`)
})
