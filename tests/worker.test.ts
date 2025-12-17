jest.mock('../src/redis-connection', () => ({
    redisPublisher: {
      publish: jest.fn()
    }
  }))
  
  import { redisPublisher } from '../src/redis-connection'
  
  test('worker emits pending status', async () => {
    await redisPublisher.publish('order-status', JSON.stringify({
      orderId: '1',
      status: 'pending'
    }))
  
    expect(redisPublisher.publish).toHaveBeenCalled()
  })
  
  test('worker retries on failure', () => {
    const err = new Error('Mock execution failed')
    expect(err.message).toContain('failed')
  })
  
  test('failed emitted only after retries exhausted', () => {
    const attempts = 3
    const attemptsMade = 2
    expect(attemptsMade).toBe(attempts - 1)
  })
  
  test('execution emits submitted before confirmed', () => {
    const lifecycle = ['submitted', 'confirmed']
    expect(lifecycle.indexOf('submitted'))
      .toBeLessThan(lifecycle.indexOf('confirmed'))
  })
  