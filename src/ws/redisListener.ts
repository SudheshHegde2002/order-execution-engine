import { sendStatus } from './orderSockets'
import { redisSubscriber } from '../redis-connection'
import { updateOrder } from '../db/orderRepo'

redisSubscriber.subscribe('order-status')//subscribe to order status

redisSubscriber.on('message', async (_, message) => {
  const payload = JSON.parse(message)

  const {
    orderId,
    status,
    dex,
    price,
    executedPrice,
    txHash,
    error
  } = payload

  try {
    const updates: any = {
      status
    }

    if (dex !== undefined) updates.dex = dex
    if (price !== undefined) updates.quoted_price = price
    if (executedPrice !== undefined) updates.executed_price = executedPrice
    if (txHash !== undefined) updates.tx_hash = txHash
    if (error !== undefined) updates.error_reason = error

    await updateOrder(orderId, updates)//update order status in database

    sendStatus(orderId, status, payload)//send status to websocket
  } catch (err) {
    console.error('Failed to handle order-status message:', err)
  }
})
