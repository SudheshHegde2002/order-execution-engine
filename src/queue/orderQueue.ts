import { Queue } from 'bullmq'
import { redis } from './connection'

export const orderQueue = new Queue('orders', {
  connection: redis
})
