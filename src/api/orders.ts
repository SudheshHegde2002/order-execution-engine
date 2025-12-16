import { FastifyInstance } from 'fastify'
import { v4 as uuidv4 } from 'uuid'
import WebSocket from 'ws'
import { OrderRequest } from '../types/order'
import { attachSocket, detachSocket } from '../ws/orderSockets'

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
    (connection: WebSocket, req) => {
      const { orderId } = req.query as { orderId: string }

      if (!orderId) {
        connection.close()
        return
      }

      attachSocket(orderId, connection)

      connection.send(
        JSON.stringify({ orderId, status: 'connected' })
      )

      connection.on('close', () => {
        detachSocket(orderId)
      })
    }
  )
  
}
