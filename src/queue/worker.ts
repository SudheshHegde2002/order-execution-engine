import { Worker } from 'bullmq'
import { redisQueue, redisPublisher } from '../redis-connection'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const worker = new Worker(
  'orders',
  async job => {
    const { orderId } = job.data

    const steps = [
      'pending',
      'routing',
      'building',
      'submitted',
      'confirmed'
    ]

    for (const step of steps) {
      console.log(`Sending status: ${step} for orderId: ${orderId}`)
      await redisPublisher.publish(
        'order-status',
        JSON.stringify({ orderId, status: step })
      )
      await sleep(1000)
    }
    
    console.log(`Completed processing orderId: ${orderId}`)
  },
  {
    connection: redisQueue,
    concurrency: 10
  }
)

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err)
})

worker.on('error', (err) => {
  console.error('Worker error:', err)
})

console.log('Worker initialized and listening for jobs...')
