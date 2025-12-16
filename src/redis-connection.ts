import { Redis } from 'ioredis'
import dotenv from 'dotenv'

dotenv.config()

export const redisQueue = new Redis(process.env.REDIS_URL!)
export const redisSubscriber = new Redis(process.env.REDIS_URL!)
export const redisPublisher = new Redis(process.env.REDIS_URL!)
