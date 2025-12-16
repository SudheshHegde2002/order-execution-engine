import { sendStatus } from './orderSockets'
import { redisSubscriber } from '../redis-connection'

redisSubscriber.subscribe('order-status')

redisSubscriber.on('message', (_, message) => {
  const payload = JSON.parse(message)
  const { orderId, status } = payload

  sendStatus(orderId, status)
})
