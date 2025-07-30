import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Order } from '@/domain/fastfood/enterprise/entities'
import { Status } from '@/domain/fastfood/enterprise/entities/value-objects'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { UpdateOrderStatusUseCase } from './update-order-status'

describe('Update Order Status', () => {
  let sut: UpdateOrderStatusUseCase
  let mockOrderRepository: any

  beforeEach(() => {
    mockOrderRepository = {
      findById: vi.fn(),
      save: vi.fn()
    }

    sut = new UpdateOrderStatusUseCase(mockOrderRepository)
  })

  it('should be able to update order status', async () => {
    const order = Order.create({
      customerId: new UniqueEntityID('customer-1')
    })

    mockOrderRepository.findById.mockResolvedValue(order)
    mockOrderRepository.save.mockResolvedValue(order)

    const result = await sut.execute({
      id: 'order-1',
      status: Status.IN_PREPARATION
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order.status?.getValue()).toBe(Status.IN_PREPARATION)
      expect(mockOrderRepository.save).toHaveBeenCalledWith(order)
    }
  })

  it('should return error when order is not found', async () => {
    mockOrderRepository.findById.mockResolvedValue(null)

    const result = await sut.execute({
      id: 'non-existent',
      status: Status.IN_PREPARATION
    })

    expect(result.isLeft()).toBe(true)
    if (result.isLeft()) {
      expect(result.value).toBeInstanceOf(ResourceNotFoundError)
    }
  })

  it('should update order status with different values', async () => {
    const order = Order.create({
      customerId: new UniqueEntityID('customer-1')
    })

    mockOrderRepository.findById.mockResolvedValue(order)
    mockOrderRepository.save.mockResolvedValue(order)

    const result = await sut.execute({
      id: 'order-1',
      status: Status.READY
    })

    expect(result.isRight()).toBe(true)
    if (result.isRight()) {
      expect(result.value.order.status?.getValue()).toBe(Status.READY)
    }
  })
})
