import { pg } from './postgres'

export async function createOrder(orderId: string) {
  await pg.query(
    `
    insert into orders (order_id, status)
    values ($1, 'pending')
    on conflict (order_id) do nothing
    `,
    [orderId]
  )
}

export async function updateOrder(
  orderId: string,
  data: {
    status?: string
    dex?: string
    quoted_price?: number
    executed_price?: number
    tx_hash?: string
    error_reason?: string
  }
) {
  const keys = Object.keys(data)
  if (keys.length === 0) return

  const values = keys.map(k => (data as any)[k])
  const sets = keys.map((k, i) => `${k} = $${i + 2}`)

  await pg.query(
    `
    update orders
    set ${sets.join(', ')}, updated_at = now()
    where order_id = $1
    `,
    [orderId, ...values]
  )
}
