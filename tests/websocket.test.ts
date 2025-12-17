import { attachSocket, detachSocket, hasSocket } from '../src/ws/orderSockets'

const mockSocket: any = {
  readyState: 1,
  send: jest.fn()
}

test('socket attaches on connect', () => {
  attachSocket('order1', mockSocket)
  expect(hasSocket('order1')).toBe(true)
})

test('socket detaches on close', () => {
  detachSocket('order1')
  expect(hasSocket('order1')).toBe(false)
})

test('status is sent over socket', () => {
  attachSocket('order2', mockSocket)
  mockSocket.send(JSON.stringify({ status: 'pending' }))
  expect(mockSocket.send).toHaveBeenCalled()
})
