import { FastifyInstance } from 'fastify'
import { v4 as uuidv4 } from 'uuid'
import { OrderRequest } from '../types/order'

export async function orderRoutes(app: FastifyInstance) {

  app.post('/api/orders/execute', async (req, reply) => {
    const body = req.body as OrderRequest

    if (
      typeof body.tokenIn !== 'string' ||
      typeof body.tokenOut !== 'string' ||
      typeof body.amount !== 'number'
    ) {
      return reply.status(400).send({ error: 'Invalid order' })
    }

    const orderId = uuidv4()
    return { orderId }
  })

  app.get(
    '/api/orders/execute',
    { websocket: true },
    (connection) => {
      connection.socket.send(
        JSON.stringify({ message: 'WebSocket connected' })
      )

      const ping = setInterval(() => {
        if (connection.socket.readyState === connection.socket.CLOSED) {
          clearInterval(ping)
          return
        }
        connection.socket.ping()
      }, 20000)

      connection.socket.on('close', () => {
        clearInterval(ping)
        console.log('WebSocket closed')
      })
    }
  )
  
}
