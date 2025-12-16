import { sendStatus } from './orderSockets'

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms))

export async function simulateOrder(orderId: string) {
  const steps = [
    'pending',
    'routing',
    'building',
    'submitted',
    'confirmed'
  ]

  for (const step of steps) {
    sendStatus(orderId, step)
    await sleep(1000)
  }
}
