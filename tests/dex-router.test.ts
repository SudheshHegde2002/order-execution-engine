import { MockDexRouter } from '../src/dex/MockDexRouter'

test('chooses Raydium when price is better', async () => {
  const router = new MockDexRouter()

  jest.spyOn(router, 'getRaydiumQuote').mockResolvedValue({
    dex: 'raydium', price: 102, fee: 0.003
  })
  jest.spyOn(router, 'getMeteoraQuote').mockResolvedValue({
    dex: 'meteora', price: 98, fee: 0.002
  })

  const best = await router.getBestQuote(1)
  expect(best.best.dex).toBe('raydium')
})

test('chooses Meteora when price is better', async () => {
  const router = new MockDexRouter()

  jest.spyOn(router, 'getRaydiumQuote').mockResolvedValue({
    dex: 'raydium', price: 97, fee: 0.003
  })
  jest.spyOn(router, 'getMeteoraQuote').mockResolvedValue({
    dex: 'meteora', price: 101, fee: 0.002
  })

  const best = await router.getBestQuote(1)
  expect(best.best.dex).toBe('meteora')
})

test('returns deterministic best quote', async () => {
  const router = new MockDexRouter()
  const best = await router.getBestQuote(1)
  expect(best.best).toHaveProperty('price')
  expect(best.best).toHaveProperty('dex')
})
