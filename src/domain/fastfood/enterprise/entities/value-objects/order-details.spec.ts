import { UniqueEntityID } from '@/core/entities/unique-entity-id'
import { describe, expect, it } from 'vitest'
import { Product } from '../product'
import { Category } from './category'
import { OrderDetails } from './order-details'
import { Status } from './status'

describe('OrderDetails Value Object', () => {
  describe('when creating order details', () => {
    it('should create order details with all required properties', () => {
      const customerId = new UniqueEntityID('customer-1')
      const products = [
        Product.create({
          name: 'X-Burger',
          description: 'Delicious burger',
          price: 15.99,
          category: Category.create('Lanche')
        })
      ]
      const status = Status.create('Recebido')
      const createdAt = new Date()

      const orderDetails = OrderDetails.create({
        customerId,
        products,
        status,
        createdAt
      })

      expect(orderDetails.customerId).toBe(customerId)
      expect(orderDetails.products).toEqual(products)
      expect(orderDetails.status).toBe(status)
      expect(orderDetails.createdAt).toBe(createdAt)
      expect(orderDetails.updatedAt).toBeUndefined()
    })

    it('should create order details with optional updatedAt', () => {
      const customerId = new UniqueEntityID('customer-1')
      const products = [
        Product.create({
          name: 'X-Burger',
          description: 'Delicious burger',
          price: 15.99,
          category: Category.create('Lanche')
        })
      ]
      const status = Status.create('Recebido')
      const createdAt = new Date()
      const updatedAt = new Date()

      const orderDetails = OrderDetails.create({
        customerId,
        products,
        status,
        createdAt,
        updatedAt
      })

      expect(orderDetails.updatedAt).toBe(updatedAt)
    })
  })

  describe('when accessing order details properties', () => {
    it('should return correct customer ID', () => {
      const customerId = new UniqueEntityID('customer-123')
      const products = []
      const status = Status.create('Recebido')
      const createdAt = new Date()

      const orderDetails = OrderDetails.create({
        customerId,
        products,
        status,
        createdAt
      })

      expect(orderDetails.customerId.toString()).toBe('customer-123')
    })

    it('should return correct products array', () => {
      const customerId = new UniqueEntityID('customer-1')
      const products = [
        Product.create({
          name: 'X-Burger',
          description: 'Delicious burger',
          price: 15.99,
          category: Category.create('Lanche')
        }),
        Product.create({
          name: 'French Fries',
          description: 'Crispy fries',
          price: 8.99,
          category: Category.create('Acompanhamento')
        })
      ]
      const status = Status.create('Recebido')
      const createdAt = new Date()

      const orderDetails = OrderDetails.create({
        customerId,
        products,
        status,
        createdAt
      })

      expect(orderDetails.products).toHaveLength(2)
      expect(orderDetails.products[0].name).toBe('X-Burger')
      expect(orderDetails.products[1].name).toBe('French Fries')
    })

    it('should return correct status', () => {
      const customerId = new UniqueEntityID('customer-1')
      const products = []
      const status = Status.create('Pronto')
      const createdAt = new Date()

      const orderDetails = OrderDetails.create({
        customerId,
        products,
        status,
        createdAt
      })

      expect(orderDetails.status.getValue()).toBe('Pronto')
    })

    it('should return correct creation date', () => {
      const customerId = new UniqueEntityID('customer-1')
      const products = []
      const status = Status.create('Recebido')
      const createdAt = new Date('2024-01-01T10:00:00Z')

      const orderDetails = OrderDetails.create({
        customerId,
        products,
        status,
        createdAt
      })

      expect(orderDetails.createdAt).toEqual(createdAt)
    })
  })
})
