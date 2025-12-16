import WebSocket from 'ws'

const orderSockets = new Map<string, WebSocket>()

export function attachSocket(orderId: string, socket: WebSocket) {
  orderSockets.set(orderId, socket) // per order a socket is attached
  console.log(`Socket attached for orderId: ${orderId}, readyState: ${socket.readyState}`)
}

export function sendStatus(orderId: string, status: string, data?: any) {
  const socket = orderSockets.get(orderId)
  if (!socket) {
    console.log(`No socket found for orderId: ${orderId}`)
    return
  }

  if (socket.readyState !== WebSocket.OPEN) {
    console.log(`Socket not open for orderId: ${orderId}, readyState: ${socket.readyState}`)
    return
  }

  try {
    const message = JSON.stringify({
      orderId,
      status,
      ...data
    })
    socket.send(message)
    console.log(`Sent status ${status} to orderId: ${orderId}`)
  } catch (error) {
    console.error(`Error sending status to orderId: ${orderId}:`, error)
  }
}

export function detachSocket(orderId: string) {
  orderSockets.delete(orderId)
}

export function hasSocket(orderId: string): boolean {
  return orderSockets.has(orderId)
}

export function getAllOrderIds(): string[] {
  return Array.from(orderSockets.keys())
}
