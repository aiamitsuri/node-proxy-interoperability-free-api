import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { compress } from 'hono/compress'
import { proxy } from 'hono/proxy'
import { rateLimiter } from 'hono-rate-limiter'

const app = new Hono()

const RUST_SOURCE = "https://interoperability.onrender.com/filter"
const TARGET_HOST = "interoperability.onrender.com"

app.use('*', logger()) 

app.use('*', compress())
app.use('/filter', cors({ origin: '*', allowMethods: ['GET', 'OPTIONS'] }))

app.use('/filter', rateLimiter({
  windowMs: 60 * 1000,
  limit: 20,
  keyGenerator: (c) => c.req.header('x-forwarded-for') || (c.env as any)?.incoming?.socket?.remoteAddress || '0.0.0.0',
  handler: (c) => c.json({ error: 'Too many requests, slow down!' }, 429)
}))

app.get('/filter', async (c) => {
  try {
    const url = new URL(c.req.url)
    const targetURL = `${RUST_SOURCE}${url.search}`

    return await proxy(targetURL, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Hono-Proxy-Server',
        'Host': TARGET_HOST, 
        'X-Forwarded-For': c.req.header('x-forwarded-for') || '0.0.0.0'
      }
    })
  } catch (err) {
    console.error('Proxy Error:', err)
    return c.json({ error: 'Remote server unreachable' }, 502)
  }
})

const port = Number(process.env.PORT) || 9001
serve({ fetch: app.fetch, port })