import { Redis } from 'ioredis'
import dotenv from 'dotenv'

dotenv.config()

const redisOptions = {
  maxRetriesPerRequest: null
}

export const redisQueue = new Redis(process.env.REDIS_URL!, redisOptions)
export const redisSubscriber = new Redis(process.env.REDIS_URL!, redisOptions)
export const redisPublisher = new Redis(process.env.REDIS_URL!, redisOptions)
