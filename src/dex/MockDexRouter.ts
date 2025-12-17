const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

export class MockDexRouter {
  private basePrice = 100

  async getRaydiumQuote(amount: number) {
    await sleep(200)
    return {
      dex: 'raydium',
      price: this.basePrice * (0.98 + Math.random() * 0.04), 
      fee: 0.003
    }
  }

  async getMeteoraQuote(amount: number) {
    await sleep(200)
    return {
      dex: 'meteora',
      price: this.basePrice * (0.97 + Math.random() * 0.05),
      fee: 0.002
    }
  }

  async getBestQuote(amount: number) {//mock router implementation to get best quote
    const [raydium, meteora] = await Promise.all([
      this.getRaydiumQuote(amount),
      this.getMeteoraQuote(amount)
    ])

    const best = raydium.price > meteora.price ? raydium : meteora
    return { best, raydium, meteora }
  }
}
