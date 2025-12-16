import { Worker } from 'bullmq'
import { redisQueue, redisPublisher } from '../redis-connection'
import { MockDexRouter } from '../dex/MockDexRouter'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const worker = new Worker(
  'orders',
  async job => {
    const { orderId } = job.data

    const steps = [
        'building',
        'submitted',
        'confirmed'
      ]
      

    await redisPublisher.publish(
        'order-status',
        JSON.stringify({ orderId, status: 'pending' })
      )
      await sleep(1000)

    const router = new MockDexRouter()
    const bestQuote = await router.getBestQuote(1)

    await redisPublisher.publish(
        'order-status',
        JSON.stringify({
          orderId,
          status: 'routing',
          dex: bestQuote.dex,
          price: bestQuote.price
        })
      )
      await sleep(1000)

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
