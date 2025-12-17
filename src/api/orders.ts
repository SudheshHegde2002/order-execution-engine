import { FastifyInstance } from 'fastify'
import { v4 as uuidv4 } from 'uuid'
import WebSocket from 'ws'
import { OrderRequest } from '../types/order'
import { attachSocket, detachSocket, hasSocket } from '../ws/orderSockets'
import { orderQueue } from '../queue/orderQueue'
import { createOrder } from '../db/orderRepo'


export async function orderRoutes(app: FastifyInstance) {

  app.post('/api/orders/execute', {//post method to create order
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
    try {
      await createOrder(orderId)//create order in database
    } catch (error: any) {
      console.error('Failed to create order:', error)
      return reply.status(500).send({ error: 'Failed to create order', details: error.message })
    }


    return { orderId }
  })

  app.get(//websocket method to get order status
    '/api/orders/execute',
    { websocket: true },
    async (connection: WebSocket, req) => {
      const { orderId } = req.query as { orderId: string }

      if (!orderId) {
        connection.close()
        return
      }

      attachSocket(orderId, connection)

      connection.send(
        JSON.stringify({ orderId, status: 'connected' })
      )
     
      console.log(`Adding job to queue for orderId: ${orderId}`)
      console.log(`Socket attached before adding job: ${hasSocket(orderId)}`)

      const job = await orderQueue.add(//add job to queue to execute order
        'execute-order',
        { orderId },
        {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 1000
          },
          delay: 500
        }
      )
      console.log(`Job added with id: ${job.id} for orderId: ${orderId}`)

      connection.on('close', () => {
        detachSocket(orderId)
      })
    }
  )
  
}
