import { beforeEach, describe, expect, it, vi } from 'vitest'
import { MicroserviceCommunicationService } from '../services/microservice-communication.service'
import { PaymentApprovedController } from './payment-approved.controller'

describe('PaymentApprovedController', () => {
  let controller: PaymentApprovedController
  let mockMicroserviceCommunication: MicroserviceCommunicationService

  beforeEach(() => {
    mockMicroserviceCommunication = {
      getOrderById: vi.fn(),
      updateOrderStatus: vi.fn(),
      notifyPaymentService: vi.fn()
    } as any

    controller = new PaymentApprovedController(mockMicroserviceCommunication)
  })

  it('should successfully process payment approved notification', async () => {
    const mockOrder = {
      id: 'order-1',
      customerId: 'customer-1',
      status: 'pending',
      paymentStatus: 'approved',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    vi.mocked(mockMicroserviceCommunication.getOrderById).mockResolvedValue(
      mockOrder
    )
    vi.mocked(
      mockMicroserviceCommunication.updateOrderStatus
    ).mockResolvedValue()
    vi.mocked(
      mockMicroserviceCommunication.notifyPaymentService
    ).mockResolvedValue()

    const result = await controller.handle({
      orderId: 'order-1',
      status: 'payment_approved'
    })

    expect(result).toEqual({
      message: 'Pedido iniciado para preparação',
      orderId: 'order-1',
      status: 'preparing'
    })

    expect(mockMicroserviceCommunication.getOrderById).toHaveBeenCalledWith(
      'order-1'
    )
    expect(
      mockMicroserviceCommunication.updateOrderStatus
    ).toHaveBeenCalledWith('order-1', 'preparing')
    expect(
      mockMicroserviceCommunication.notifyPaymentService
    ).toHaveBeenCalledWith('order-1', 'preparing')
  })

  it('should throw error when getOrderById fails', async () => {
    vi.mocked(mockMicroserviceCommunication.getOrderById).mockRejectedValue(
      new Error('Order not found')
    )

    await expect(
      controller.handle({
        orderId: 'order-1',
        status: 'payment_approved'
      })
    ).rejects.toThrow('Erro ao processar notificação de pagamento aprovado')
  })

  it('should throw error when updateOrderStatus fails', async () => {
    const mockOrder = {
      id: 'order-1',
      customerId: 'customer-1',
      status: 'pending',
      paymentStatus: 'approved',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    vi.mocked(mockMicroserviceCommunication.getOrderById).mockResolvedValue(
      mockOrder
    )
    vi.mocked(
      mockMicroserviceCommunication.updateOrderStatus
    ).mockRejectedValue(new Error('Update failed'))

    await expect(
      controller.handle({
        orderId: 'order-1',
        status: 'payment_approved'
      })
    ).rejects.toThrow('Erro ao processar notificação de pagamento aprovado')
  })

  it('should throw error when notifyPaymentService fails', async () => {
    const mockOrder = {
      id: 'order-1',
      customerId: 'customer-1',
      status: 'pending',
      paymentStatus: 'approved',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    vi.mocked(mockMicroserviceCommunication.getOrderById).mockResolvedValue(
      mockOrder
    )
    vi.mocked(
      mockMicroserviceCommunication.updateOrderStatus
    ).mockResolvedValue()
    vi.mocked(
      mockMicroserviceCommunication.notifyPaymentService
    ).mockRejectedValue(new Error('Notification failed'))

    await expect(
      controller.handle({
        orderId: 'order-1',
        status: 'payment_approved'
      })
    ).rejects.toThrow('Erro ao processar notificação de pagamento aprovado')
  })

  it('should process notification with different order ID', async () => {
    const mockOrder = {
      id: 'order-2',
      customerId: 'customer-2',
      status: 'pending',
      paymentStatus: 'approved',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    vi.mocked(mockMicroserviceCommunication.getOrderById).mockResolvedValue(
      mockOrder
    )
    vi.mocked(
      mockMicroserviceCommunication.updateOrderStatus
    ).mockResolvedValue()
    vi.mocked(
      mockMicroserviceCommunication.notifyPaymentService
    ).mockResolvedValue()

    const result = await controller.handle({
      orderId: 'order-2',
      status: 'payment_approved'
    })

    expect(result).toEqual({
      message: 'Pedido iniciado para preparação',
      orderId: 'order-2',
      status: 'preparing'
    })

    expect(mockMicroserviceCommunication.getOrderById).toHaveBeenCalledWith(
      'order-2'
    )
    expect(
      mockMicroserviceCommunication.updateOrderStatus
    ).toHaveBeenCalledWith('order-2', 'preparing')
    expect(
      mockMicroserviceCommunication.notifyPaymentService
    ).toHaveBeenCalledWith('order-2', 'preparing')
  })

  it('should process notification with different status', async () => {
    const mockOrder = {
      id: 'order-1',
      customerId: 'customer-1',
      status: 'pending',
      paymentStatus: 'approved',
      createdAt: new Date(),
      updatedAt: new Date()
    }

    vi.mocked(mockMicroserviceCommunication.getOrderById).mockResolvedValue(
      mockOrder
    )
    vi.mocked(
      mockMicroserviceCommunication.updateOrderStatus
    ).mockResolvedValue()
    vi.mocked(
      mockMicroserviceCommunication.notifyPaymentService
    ).mockResolvedValue()

    const result = await controller.handle({
      orderId: 'order-1',
      status: 'different_status'
    })

    expect(result).toEqual({
      message: 'Pedido iniciado para preparação',
      orderId: 'order-1',
      status: 'preparing'
    })
  })
})
