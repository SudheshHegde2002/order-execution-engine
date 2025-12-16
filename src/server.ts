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

  await app.listen({ port: 3000 })
  console.log('Server running')
}

start().catch(err => {
  console.error(err)
  process.exit(1)
})
