import { Redis } from 'ioredis'

const redisConfig = {
  host: '127.0.0.1',
  port: 6379,
  maxRetriesPerRequest: null
}

export const redisQueue = new Redis(redisConfig)

export const redisSubscriber = new Redis(redisConfig)

export const redisPublisher = new Redis(redisConfig)
