import { left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Order } from '@/domain/fastfood/enterprise/entities'
import { OrderProduct } from '@/domain/fastfood/enterprise/entities/order-product'
import { OrderProductList } from '@/domain/fastfood/enterprise/entities/order-product-list'
import { Status } from '@/domain/fastfood/enterprise/entities/value-objects'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetProductionQueueController } from './get-production-queue.controller'

describe('GetProductionQueueController', () => {
  let sut: GetProductionQueueController
  let mockGetAllOrder: any

  beforeEach(() => {
    mockGetAllOrder = {
      execute: vi.fn()
    }

    sut = new GetProductionQueueController(mockGetAllOrder)
  })

  describe('when getting production queue', () => {
    it('should return all orders in queue without filters', async () => {
      const order1 = Order.create(
        {
          customerId: new UniqueEntityID('customer-1')
        },
        new UniqueEntityID('order-1')
      )
      order1.status = Status.create('Recebido')

      const order2 = Order.create(
        {
          customerId: new UniqueEntityID('customer-2')
        },
        new UniqueEntityID('order-2')
      )
      order2.status = Status.create('Preparação')

      const orderProducts1 = [
        OrderProduct.create({
          orderId: order1.id,
          productId: new UniqueEntityID('product-1')
        })
      ]
      order1.products = new OrderProductList(orderProducts1)

      const orderProducts2 = [
        OrderProduct.create({
          orderId: order2.id,
          productId: new UniqueEntityID('product-2')
        })
      ]
      order2.products = new OrderProductList(orderProducts2)

      mockGetAllOrder.execute.mockResolvedValue(
        right({ orders: [order1, order2] })
      )

      const result = await sut.handle({})

      expect(result).toEqual({
        queue: [
          {
            id: 'order-1',
            customerId: 'customer-1',
            status: 'Recebido',
            paymentStatus: undefined,
            createdAt: order1.createdAt,
            updatedAt: order1.updatedAt,
            products: [
              {
                id: orderProducts1[0].id.toString(),
                productId: 'product-1'
              }
            ]
          },
          {
            id: 'order-2',
            customerId: 'customer-2',
            status: 'Preparação',
            paymentStatus: undefined,
            createdAt: order2.createdAt,
            updatedAt: order2.updatedAt,
            products: [
              {
                id: orderProducts2[0].id.toString(),
                productId: 'product-2'
              }
            ]
          }
        ],
        total: 2
      })
    })

    it('should filter orders by status', async () => {
      const order1 = Order.create(
        {
          customerId: new UniqueEntityID('customer-1')
        },
        new UniqueEntityID('order-1')
      )
      order1.status = Status.create('Recebido')

      const order2 = Order.create(
        {
          customerId: new UniqueEntityID('customer-2')
        },
        new UniqueEntityID('order-2')
      )
      order2.status = Status.create('Preparação')

      const orderProducts1 = [
        OrderProduct.create({
          orderId: order1.id,
          productId: new UniqueEntityID('product-1')
        })
      ]
      order1.products = new OrderProductList(orderProducts1)

      mockGetAllOrder.execute.mockResolvedValue(
        right({ orders: [order1, order2] })
      )

      const result = await sut.handle({ status: 'Recebido' })

      expect(result.queue).toHaveLength(1)
      expect(result.queue[0].status).toBe('Recebido')
      expect(result.total).toBe(1)
    })

    it('should limit the number of orders returned', async () => {
      const orders: Order[] = []
      for (let i = 1; i <= 5; i++) {
        const order = Order.create(
          {
            customerId: new UniqueEntityID(`customer-${i}`)
          },
          new UniqueEntityID(`order-${i}`)
        )
        order.status = Status.create('Recebido')

        const orderProducts = [
          OrderProduct.create({
            orderId: order.id,
            productId: new UniqueEntityID(`product-${i}`)
          })
        ]
        order.products = new OrderProductList(orderProducts)
        orders.push(order)
      }

      mockGetAllOrder.execute.mockResolvedValue(right({ orders }))

      const result = await sut.handle({ limit: 3 })

      expect(result.queue).toHaveLength(3)
      expect(result.total).toBe(3)
    })

    it('should filter by status and limit simultaneously', async () => {
      const order1 = Order.create(
        {
          customerId: new UniqueEntityID('customer-1')
        },
        new UniqueEntityID('order-1')
      )
      order1.status = Status.create('Recebido')

      const order2 = Order.create(
        {
          customerId: new UniqueEntityID('customer-2')
        },
        new UniqueEntityID('order-2')
      )
      order2.status = Status.create('Recebido')

      const orderProducts1 = [
        OrderProduct.create({
          orderId: order1.id,
          productId: new UniqueEntityID('product-1')
        })
      ]
      order1.products = new OrderProductList(orderProducts1)

      const orderProducts2 = [
        OrderProduct.create({
          orderId: order2.id,
          productId: new UniqueEntityID('product-2')
        })
      ]
      order2.products = new OrderProductList(orderProducts2)

      mockGetAllOrder.execute.mockResolvedValue(
        right({ orders: [order1, order2] })
      )

      const result = await sut.handle({ status: 'Recebido', limit: 1 })

      expect(result.queue).toHaveLength(1)
      expect(result.queue[0].status).toBe('Recebido')
      expect(result.total).toBe(1)
    })
  })

  describe('when handling errors', () => {
    it('should handle use case error', async () => {
      mockGetAllOrder.execute.mockResolvedValue(
        left(new Error('Erro ao buscar fila de produção'))
      )

      await expect(sut.handle({})).rejects.toThrow(
        'Erro ao buscar fila de produção'
      )

      expect(mockGetAllOrder.execute).toHaveBeenCalled()
    })
  })

  describe('when sorting orders', () => {
    it('should sort orders by creation date (oldest first)', async () => {
      const order1 = Order.create(
        {
          customerId: new UniqueEntityID('customer-1')
        },
        new UniqueEntityID('order-1')
      )
      order1.status = Status.create('Recebido')

      const order2 = Order.create(
        {
          customerId: new UniqueEntityID('customer-2')
        },
        new UniqueEntityID('order-2')
      )
      order2.status = Status.create('Recebido')

      const orderProducts1 = [
        OrderProduct.create({
          orderId: order1.id,
          productId: new UniqueEntityID('product-1')
        })
      ]
      order1.products = new OrderProductList(orderProducts1)

      const orderProducts2 = [
        OrderProduct.create({
          orderId: order2.id,
          productId: new UniqueEntityID('product-2')
        })
      ]
      order2.products = new OrderProductList(orderProducts2)

      mockGetAllOrder.execute.mockResolvedValue(
        right({ orders: [order1, order2] })
      )

      const result = await sut.handle({})

      expect(result.queue).toHaveLength(2)
      expect(result.queue[0].id).toBeDefined()
      expect(result.queue[1].id).toBeDefined()
    })
  })

  describe('when handling edge cases', () => {
    it('should handle empty orders list', async () => {
      mockGetAllOrder.execute.mockResolvedValue(right({ orders: [] }))

      const result = await sut.handle({})

      expect(result.queue).toEqual([])
      expect(result.total).toBe(0)
    })

    it('should handle orders without status', async () => {
      const order = Order.create(
        {
          customerId: new UniqueEntityID('customer-1')
        },
        new UniqueEntityID('order-1')
      )
      order.products = new OrderProductList([])

      mockGetAllOrder.execute.mockResolvedValue(right({ orders: [order] }))

      const result = await sut.handle({})

      expect(result.queue).toHaveLength(1)
      expect(result.queue[0].status).toBeUndefined()
    })

    it('should handle orders without products', async () => {
      const order = Order.create(
        {
          customerId: new UniqueEntityID('customer-1')
        },
        new UniqueEntityID('order-1')
      )
      order.status = Status.create('Recebido')
      order.products = new OrderProductList([])

      mockGetAllOrder.execute.mockResolvedValue(right({ orders: [order] }))

      const result = await sut.handle({})

      expect(result.queue).toHaveLength(1)
      expect(result.queue[0].products).toEqual([])
    })
  })
})
