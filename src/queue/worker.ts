import { Worker } from 'bullmq'
import { redisQueue, redisPublisher } from '../redis-connection'
import { MockDexRouter } from '../dex/MockDexRouter'

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

const randomDelay = () => 2000 + Math.random() * 1000
const shouldFail = () => Math.random() < 0.15
const generateTxHash = () =>
  '0x' + Math.random().toString(16).slice(2, 10)

const worker = new Worker(
  'orders',
  async job => {
    const { orderId } = job.data

    try {
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

      await redisPublisher.publish(
        'order-status',
        JSON.stringify({ orderId, status: 'building' })
      )
      await sleep(1000)

      const txHash = generateTxHash()
      await redisPublisher.publish(
        'order-status',
        JSON.stringify({
          orderId,
          status: 'submitted',
          txHash
        })
      )

      await sleep(randomDelay())

      if (shouldFail()) {
        throw new Error('Mock execution failed due to some error')
      }

      await redisPublisher.publish(
        'order-status',
        JSON.stringify({
          orderId,
          status: 'confirmed',
          executedPrice: bestQuote.price
        })
      )

    } catch (err: any) {
      if (job.attemptsMade >= (job.opts.attempts ?? 1) - 1) {
        await redisPublisher.publish(
          'order-status',
          JSON.stringify({
            orderId,
            status: 'failed',
            error: err.message
          })
        )
      }

      throw err
    }
  },
  {
    connection: redisQueue,
    concurrency: 10
  }
)

worker.on('completed', job => {
  console.log(`Job ${job.id} completed`)
})

worker.on('failed', (job, err) => {
  console.error(`Job ${job?.id} failed:`, err.message)
})

worker.on('error', err => {
  console.error('Worker error:', err)
})

console.log('Worker initialized and listening for jobs...')
