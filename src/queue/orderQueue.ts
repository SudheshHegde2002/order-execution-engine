import { Queue } from 'bullmq'
import { redisQueue } from '../redis-connection'

export const orderQueue = new Queue('orders', {
  connection: redisQueue
})
