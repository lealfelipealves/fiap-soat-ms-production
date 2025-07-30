import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UpdateProductionStatusController } from './update-production-status.controller'

describe('UpdateProductionStatusController', () => {
  let sut: UpdateProductionStatusController
  let mockUpdateOrderStatus: any
  let mockMicroserviceCommunication: any

  beforeEach(() => {
    mockUpdateOrderStatus = {
      execute: vi.fn()
    }

    mockMicroserviceCommunication = {
      updateOrderStatus: vi.fn(),
      notifyPaymentService: vi.fn()
    }

    sut = new UpdateProductionStatusController(
      mockUpdateOrderStatus,
      mockMicroserviceCommunication
    )
  })

  describe('when updating production status', () => {
    it('should update production status successfully', async () => {
      const orderId = 'order-123'
      const body = {
        status: 'Preparação',
        notes: 'Iniciando preparação do pedido'
      }

      const result = await sut.handle(orderId, body)

      expect(result).toEqual({
        message: 'Status de produção atualizado com sucesso',
        orderId: 'order-123',
        status: 'Preparação',
        notes: 'Iniciando preparação do pedido',
        updatedAt: expect.any(Date)
      })

      expect(
        mockMicroserviceCommunication.updateOrderStatus
      ).toHaveBeenCalledWith('order-123', 'Preparação')
      expect(
        mockMicroserviceCommunication.notifyPaymentService
      ).toHaveBeenCalledWith('order-123', 'Preparação')
    })

    it('should update status without notes', async () => {
      const orderId = 'order-456'
      const body = {
        status: 'Pronto'
      }

      const result = await sut.handle(orderId, body)

      expect(result).toEqual({
        message: 'Status de produção atualizado com sucesso',
        orderId: 'order-456',
        status: 'Pronto',
        notes: undefined,
        updatedAt: expect.any(Date)
      })

      expect(
        mockMicroserviceCommunication.updateOrderStatus
      ).toHaveBeenCalledWith('order-456', 'Pronto')
      expect(
        mockMicroserviceCommunication.notifyPaymentService
      ).toHaveBeenCalledWith('order-456', 'Pronto')
    })

    it('should handle different status values', async () => {
      const orderId = 'order-789'
      const body = {
        status: 'Finalizado',
        notes: 'Pedido finalizado e entregue'
      }

      const result = await sut.handle(orderId, body)

      expect(result.status).toBe('Finalizado')
      expect(result.notes).toBe('Pedido finalizado e entregue')
    })
  })

  describe('when handling errors', () => {
    it('should handle order status update error', async () => {
      const orderId = 'order-123'
      const body = {
        status: 'Preparação'
      }

      mockMicroserviceCommunication.updateOrderStatus.mockRejectedValue(
        new Error('Order service error')
      )

      await expect(sut.handle(orderId, body)).rejects.toThrow(
        'Order service error'
      )

      expect(
        mockMicroserviceCommunication.updateOrderStatus
      ).toHaveBeenCalledWith('order-123', 'Preparação')
    })

    it('should handle payment service notification error', async () => {
      const orderId = 'order-456'
      const body = {
        status: 'Pronto'
      }

      mockMicroserviceCommunication.notifyPaymentService.mockRejectedValue(
        new Error('Payment service error')
      )

      await expect(sut.handle(orderId, body)).rejects.toThrow(
        'Payment service error'
      )

      expect(
        mockMicroserviceCommunication.updateOrderStatus
      ).toHaveBeenCalledWith('order-456', 'Pronto')
      expect(
        mockMicroserviceCommunication.notifyPaymentService
      ).toHaveBeenCalledWith('order-456', 'Pronto')
    })
  })

  describe('when validating input parameters', () => {
    it('should handle empty order ID', async () => {
      const orderId = ''
      const body = {
        status: 'Recebido'
      }

      const result = await sut.handle(orderId, body)

      expect(result.orderId).toBe('')
      expect(
        mockMicroserviceCommunication.updateOrderStatus
      ).toHaveBeenCalledWith('', 'Recebido')
    })

    it('should handle empty status', async () => {
      const orderId = 'order-123'
      const body = {
        status: ''
      }

      const result = await sut.handle(orderId, body)

      expect(result.status).toBe('')
      expect(
        mockMicroserviceCommunication.updateOrderStatus
      ).toHaveBeenCalledWith('order-123', '')
    })

    it('should handle null body parameters', async () => {
      const orderId = 'order-123'
      const body = null as any

      await expect(sut.handle(orderId, body)).rejects.toThrow()
    })
  })

  describe('when processing different status transitions', () => {
    it('should handle status transition to preparation', async () => {
      const orderId = 'order-123'
      const body = {
        status: 'Preparação',
        notes: 'Iniciando preparação'
      }

      const result = await sut.handle(orderId, body)

      expect(result.status).toBe('Preparação')
      expect(result.notes).toBe('Iniciando preparação')
    })

    it('should handle status transition to ready', async () => {
      const orderId = 'order-456'
      const body = {
        status: 'Pronto',
        notes: 'Pedido pronto para entrega'
      }

      const result = await sut.handle(orderId, body)

      expect(result.status).toBe('Pronto')
      expect(result.notes).toBe('Pedido pronto para entrega')
    })

    it('should handle status transition to finalized', async () => {
      const orderId = 'order-789'
      const body = {
        status: 'Finalizado',
        notes: 'Pedido entregue ao cliente'
      }

      const result = await sut.handle(orderId, body)

      expect(result.status).toBe('Finalizado')
      expect(result.notes).toBe('Pedido entregue ao cliente')
    })
  })
})
