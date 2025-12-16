import { FastifyInstance } from 'fastify'
import { v4 as uuidv4 } from 'uuid'
import WebSocket from 'ws'
import { OrderRequest } from '../types/order'
import { attachSocket, detachSocket } from '../ws/orderSockets'
import { simulateOrder } from '../ws/orderLifecycle'

export async function orderRoutes(app: FastifyInstance) {

  app.post('/api/orders/execute', {
    schema: {
      body: {
        type: 'object',
        required: ['tokenIn', 'tokenOut', 'amount'],
        properties: {
          tokenIn: { type: 'string' },
          tokenOut: { type: 'string' },
          amount: { type: 'number' }
        }
      }
    }
  }, async (req, reply) => {
    const body = req.body as OrderRequest

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
      simulateOrder(orderId)

      connection.on('close', () => {
        detachSocket(orderId)
      })
    }
  )
  
}
