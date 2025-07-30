import { left, right } from '@/core/either'
import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { Order } from '@/domain/fastfood/enterprise/entities'
import { OrderProduct } from '@/domain/fastfood/enterprise/entities/order-product'
import { OrderProductList } from '@/domain/fastfood/enterprise/entities/order-product-list'
import { Status } from '@/domain/fastfood/enterprise/entities/value-objects'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetProductionOrderDetailsController } from './get-production-order-details.controller'

describe('GetProductionOrderDetailsController', () => {
  let sut: GetProductionOrderDetailsController
  let mockGetAllOrder: any
  let mockMicroserviceCommunication: any

  beforeEach(() => {
    mockGetAllOrder = {
      execute: vi.fn()
    }

    mockMicroserviceCommunication = {
      getCustomerByCpf: vi.fn(),
      getProductById: vi.fn()
    }

    sut = new GetProductionOrderDetailsController(
      mockGetAllOrder,
      mockMicroserviceCommunication
    )
  })

  describe('when getting production order details', () => {
    it('should return complete order details with customer and products', async () => {
      const orderId = 'order-123'
      const customerId = 'customer-456'

      const order = Order.create(
        {
          customerId: new UniqueEntityID(customerId)
        },
        new UniqueEntityID(orderId)
      )
      order.status = Status.create('Recebido')

      const orderProducts = [
        OrderProduct.create({
          orderId: order.id,
          productId: new UniqueEntityID('product-1')
        }),
        OrderProduct.create({
          orderId: order.id,
          productId: new UniqueEntityID('product-2')
        })
      ]
      order.products = new OrderProductList(orderProducts)

      mockGetAllOrder.execute.mockResolvedValue(right({ orders: [order] }))

      mockMicroserviceCommunication.getCustomerByCpf.mockResolvedValue({
        id: 'customer-456',
        name: 'John Doe',
        email: 'john@example.com',
        cpf: '123.456.789-01'
      })

      mockMicroserviceCommunication.getProductById.mockResolvedValueOnce({
        id: 'product-1',
        name: 'X-Burger',
        description: 'Delicious burger',
        price: 15.99,
        category: 'Lanche'
      })

      mockMicroserviceCommunication.getProductById.mockResolvedValueOnce({
        id: 'product-2',
        name: 'French Fries',
        description: 'Crispy fries',
        price: 8.99,
        category: 'Acompanhamento'
      })

      const result = await sut.handle(orderId)

      expect(result).toEqual({
        order: {
          id: 'order-123',
          customerId: 'customer-456',
          status: 'Recebido',
          paymentStatus: undefined,
          createdAt: order.createdAt,
          updatedAt: order.updatedAt
        },
        customer: {
          id: 'customer-456',
          name: 'John Doe',
          email: 'john@example.com',
          cpf: '123.456.789-01'
        },
        products: [
          {
            id: 'product-1',
            name: 'X-Burger',
            description: 'Delicious burger',
            price: 15.99,
            category: 'Lanche'
          },
          {
            id: 'product-2',
            name: 'French Fries',
            description: 'Crispy fries',
            price: 8.99,
            category: 'Acompanhamento'
          }
        ],
        productionInfo: {
          estimatedTime: 20,
          priority: expect.any(String),
          notes: [
            'Preparar X-Burger conforme padrão',
            'Preparar French Fries conforme padrão'
          ]
        }
      })

      expect(mockGetAllOrder.execute).toHaveBeenCalled()
      expect(
        mockMicroserviceCommunication.getCustomerByCpf
      ).toHaveBeenCalledWith(customerId)
      expect(
        mockMicroserviceCommunication.getProductById
      ).toHaveBeenCalledTimes(2)
    })

    it('should handle order not found', async () => {
      const orderId = 'non-existent-order'

      mockGetAllOrder.execute.mockResolvedValue(right({ orders: [] }))

      await expect(sut.handle(orderId)).rejects.toThrow('Pedido não encontrado')

      expect(mockGetAllOrder.execute).toHaveBeenCalled()
    })

    it('should handle use case error', async () => {
      const orderId = 'order-123'

      mockGetAllOrder.execute.mockResolvedValue(
        left(new Error('Erro ao buscar pedidos'))
      )

      await expect(sut.handle(orderId)).rejects.toThrow(
        'Erro ao buscar pedidos'
      )

      expect(mockGetAllOrder.execute).toHaveBeenCalled()
    })

    it('should handle microservice communication errors', async () => {
      const orderId = 'order-123'
      const customerId = 'customer-456'

      const order = Order.create(
        {
          customerId: new UniqueEntityID(customerId)
        },
        new UniqueEntityID(orderId)
      )
      order.status = Status.create('Recebido')

      const orderProducts = [
        OrderProduct.create({
          orderId: order.id,
          productId: new UniqueEntityID('product-1')
        })
      ]
      order.products = new OrderProductList(orderProducts)

      mockGetAllOrder.execute.mockResolvedValue(right({ orders: [order] }))

      mockMicroserviceCommunication.getCustomerByCpf.mockRejectedValue(
        new Error('Customer service error')
      )

      await expect(sut.handle(orderId)).rejects.toThrow(
        'Customer service error'
      )
    })
  })

  describe('when calculating production information', () => {
    it('should calculate correct estimated time for multiple products', async () => {
      const orderId = 'order-456'
      const customerId = 'customer-789'

      const order = Order.create(
        {
          customerId: new UniqueEntityID(customerId)
        },
        new UniqueEntityID(orderId)
      )
      order.status = Status.create('Preparação')

      const orderProducts = [
        OrderProduct.create({
          orderId: order.id,
          productId: new UniqueEntityID('product-1')
        }),
        OrderProduct.create({
          orderId: order.id,
          productId: new UniqueEntityID('product-2')
        }),
        OrderProduct.create({
          orderId: order.id,
          productId: new UniqueEntityID('product-3')
        })
      ]
      order.products = new OrderProductList(orderProducts)

      mockGetAllOrder.execute.mockResolvedValue(right({ orders: [order] }))

      mockMicroserviceCommunication.getCustomerByCpf.mockResolvedValue({
        id: 'customer-789',
        name: 'Jane Smith',
        email: 'jane@example.com',
        cpf: '987.654.321-00'
      })

      mockMicroserviceCommunication.getProductById.mockResolvedValue({
        id: 'product-1',
        name: 'X-Burger',
        description: 'Delicious burger',
        price: 15.99,
        category: 'Lanche'
      })

      const result = await sut.handle(orderId)

      expect(result.productionInfo.estimatedTime).toBeGreaterThan(0)
      expect(result.productionInfo.notes).toContain('X-Burger')
    })

    it('should generate correct production notes for different product categories', async () => {
      const orderId = 'order-789'
      const customerId = 'customer-123'

      const order = Order.create(
        {
          customerId: new UniqueEntityID(customerId)
        },
        new UniqueEntityID(orderId)
      )
      order.status = Status.create('Recebido')

      const orderProducts = [
        OrderProduct.create({
          orderId: order.id,
          productId: new UniqueEntityID('product-1')
        }),
        OrderProduct.create({
          orderId: order.id,
          productId: new UniqueEntityID('product-2')
        })
      ]
      order.products = new OrderProductList(orderProducts)

      mockGetAllOrder.execute.mockResolvedValue(right({ orders: [order] }))

      mockMicroserviceCommunication.getCustomerByCpf.mockResolvedValue({
        id: 'customer-123',
        name: 'Bob Wilson',
        email: 'bob@example.com',
        cpf: '111.222.333-44'
      })

      mockMicroserviceCommunication.getProductById.mockResolvedValue({
        id: 'product-1',
        name: 'Coca-Cola',
        description: 'Refrigerante',
        price: 5.99,
        category: 'Bebida'
      })

      const result = await sut.handle(orderId)

      expect(result.productionInfo.notes).toBeDefined()
      expect(Array.isArray(result.productionInfo.notes)).toBe(true)
    })
  })
})
