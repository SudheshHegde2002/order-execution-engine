import Fastify from 'fastify'
import websocket from '@fastify/websocket'

const app = Fastify()
app.register(websocket)

app.get('/', async () => {
  return { status: 'ok' }
})

app.listen({ port: 3000 }, () => {
  console.log('Server running on http://localhost:3000')
})
