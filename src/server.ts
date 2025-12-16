import Fastify from 'fastify'
import websocket from '@fastify/websocket'
import { orderRoutes } from './api/orders'
import './ws/redisListener'

async function start() {
  const app = Fastify()

  await app.register(websocket)

  await app.register(orderRoutes)

  app.get('/', async () => {
    return { status: 'ok' }
  })

  const PORT = Number(process.env.PORT) || 3000

  app.listen({ port: PORT, host: '0.0.0.0' }, () => {
    console.log(`Server running on port ${PORT}`)
  })
  
}

start().catch(err => {
  console.error(err)
  process.exit(1)
})
