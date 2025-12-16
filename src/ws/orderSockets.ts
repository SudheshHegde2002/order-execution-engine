import WebSocket from 'ws'

const orderSockets = new Map<string, WebSocket>()

export function attachSocket(orderId: string, socket: WebSocket) {
  orderSockets.set(orderId, socket)
}

export function sendStatus(orderId: string, status: string, data?: any) {
  const socket = orderSockets.get(orderId)
  if (!socket) return

  socket.send(
    JSON.stringify({
      orderId,
      status,
      ...data
    })
  )
}

export function detachSocket(orderId: string) {
  orderSockets.delete(orderId)
}
