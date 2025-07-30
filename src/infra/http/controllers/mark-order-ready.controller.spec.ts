import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MarkOrderReadyController } from './mark-order-ready.controller'

describe('MarkOrderReadyController', () => {
  let sut: MarkOrderReadyController
  let mockMicroserviceCommunication: any

  beforeEach(() => {
    mockMicroserviceCommunication = {
      updateOrderStatus: vi.fn(),
      notifyPaymentService: vi.fn()
    }

    sut = new MarkOrderReadyController(mockMicroserviceCommunication)
  })

  describe('when marking an order as ready', () => {
    it('should mark order as ready with default values', async () => {
      const orderId = 'order-123'
      const body = {}

      const result = await sut.handle(orderId, body)

      expect(result).toEqual({
        message: 'Pedido marcado como pronto para entrega',
        orderId: 'order-123',
        status: 'ready',
        notes: undefined,
        readyTime: expect.any(String),
        updatedAt: expect.any(Date)
      })

      expect(
        mockMicroserviceCommunication.updateOrderStatus
      ).toHaveBeenCalledWith('order-123', 'ready')
      expect(
        mockMicroserviceCommunication.notifyPaymentService
      ).toHaveBeenCalledWith('order-123', 'ready')
    })

    it('should mark order as ready with custom notes and ready time', async () => {
      const orderId = 'order-456'
      const body = {
        notes: 'Pedido pronto para retirada',
        readyTime: '2024-01-01T12:00:00Z'
      }

      const result = await sut.handle(orderId, body)

      expect(result).toEqual({
        message: 'Pedido marcado como pronto para entrega',
        orderId: 'order-456',
        status: 'ready',
        notes: 'Pedido pronto para retirada',
        readyTime: '2024-01-01T12:00:00Z',
        updatedAt: expect.any(Date)
      })

      expect(
        mockMicroserviceCommunication.updateOrderStatus
      ).toHaveBeenCalledWith('order-456', 'ready')
      expect(
        mockMicroserviceCommunication.notifyPaymentService
      ).toHaveBeenCalledWith('order-456', 'ready')
    })

    it('should handle microservice communication errors gracefully', async () => {
      const orderId = 'order-789'
      const body = {}

      mockMicroserviceCommunication.updateOrderStatus.mockRejectedValue(
        new Error('Communication error')
      )

      await expect(sut.handle(orderId, body)).rejects.toThrow(
        'Communication error'
      )

      expect(
        mockMicroserviceCommunication.updateOrderStatus
      ).toHaveBeenCalledWith('order-789', 'ready')
    })

    it('should handle payment service notification errors gracefully', async () => {
      const orderId = 'order-999'
      const body = {}

      mockMicroserviceCommunication.notifyPaymentService.mockRejectedValue(
        new Error('Payment service error')
      )

      await expect(sut.handle(orderId, body)).rejects.toThrow(
        'Payment service error'
      )

      expect(
        mockMicroserviceCommunication.updateOrderStatus
      ).toHaveBeenCalledWith('order-999', 'ready')
      expect(
        mockMicroserviceCommunication.notifyPaymentService
      ).toHaveBeenCalledWith('order-999', 'ready')
    })
  })

  describe('when validating input parameters', () => {
    it('should handle empty order ID', async () => {
      const orderId = ''
      const body = {}

      const result = await sut.handle(orderId, body)

      expect(result.orderId).toBe('')
      expect(
        mockMicroserviceCommunication.updateOrderStatus
      ).toHaveBeenCalledWith('', 'ready')
    })

    it('should handle empty body parameters', async () => {
      const orderId = 'order-123'
      const body = {}

      const result = await sut.handle(orderId, body)

      expect(result.notes).toBeUndefined()
      expect(result.readyTime).toBeDefined()
    })
  })
})
