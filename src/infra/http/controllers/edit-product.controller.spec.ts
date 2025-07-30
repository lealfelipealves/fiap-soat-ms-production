import { left, right } from '@/core/either'
import { Category } from '@/domain/fastfood/enterprise/entities/value-objects'
import { makeProduct } from 'test/factories/make-product'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { EditProductController } from './edit-product.controller'

describe('EditProductController', () => {
  let sut: EditProductController
  let mockEditProduct: any

  beforeEach(() => {
    mockEditProduct = {
      execute: vi.fn()
    }

    sut = new EditProductController(mockEditProduct)
  })

  describe('when editing a product', () => {
    it('should edit product with all fields', async () => {
      const productId = 'product-123'
      const body = {
        name: 'X-Burger Updated',
        description: 'Updated delicious burger',
        price: 18.99,
        category: 'Lanche'
      }

      const updatedProduct = makeProduct({
        name: 'X-Burger Updated',
        description: 'Updated delicious burger',
        price: 18.99,
        category: Category.create('Lanche')
      })

      mockEditProduct.execute.mockResolvedValue(
        right({ product: updatedProduct })
      )

      const result = await sut.handle(productId, body)

      expect(result).toEqual({
        product: {
          id: updatedProduct.id.toString(),
          name: 'X-Burger Updated',
          description: 'Updated delicious burger',
          price: 18.99,
          category: 'Lanche'
        }
      })

      expect(mockEditProduct.execute).toHaveBeenCalledWith({
        productId: 'product-123',
        name: 'X-Burger Updated',
        description: 'Updated delicious burger',
        price: 18.99,
        category: 'Lanche'
      })
    })

    it('should edit product with partial fields', async () => {
      const productId = 'product-456'
      const body = {
        name: 'X-Burger Partial Update',
        price: 20.5
      }

      const updatedProduct = makeProduct({
        name: 'X-Burger Partial Update',
        description: 'Original description',
        price: 20.5,
        category: Category.create('Lanche')
      })

      mockEditProduct.execute.mockResolvedValue(
        right({ product: updatedProduct })
      )

      const result = await sut.handle(productId, body)

      expect(result.product.name).toBe('X-Burger Partial Update')
      expect(result.product.price).toBe(20.5)
      expect(mockEditProduct.execute).toHaveBeenCalledWith({
        productId: 'product-456',
        name: 'X-Burger Partial Update',
        description: undefined,
        price: 20.5,
        category: undefined
      })
    })

    it('should edit product with only price update', async () => {
      const productId = 'product-789'
      const body = {
        price: 15.75
      }

      const updatedProduct = makeProduct({
        name: 'Original Name',
        description: 'Original description',
        price: 15.75,
        category: Category.create('Lanche')
      })

      mockEditProduct.execute.mockResolvedValue(
        right({ product: updatedProduct })
      )

      const result = await sut.handle(productId, body)

      expect(result.product.price).toBe(15.75)
      expect(mockEditProduct.execute).toHaveBeenCalledWith({
        productId: 'product-789',
        name: undefined,
        description: undefined,
        price: 15.75,
        category: undefined
      })
    })

    it('should handle different categories', async () => {
      const categories = ['Lanche', 'Acompanhamento', 'Bebida', 'Sobremesa']

      for (const category of categories) {
        const productId = `product-${category}`
        const body = { category, price: 10.99 }

        const updatedProduct = makeProduct({
          name: 'Test Product',
          description: 'Test description',
          price: 10.99,
          category: Category.create(category)
        })

        mockEditProduct.execute.mockResolvedValue(
          right({ product: updatedProduct })
        )

        const result = await sut.handle(productId, body)

        expect(result.product.category).toBe(category)
        expect(mockEditProduct.execute).toHaveBeenCalledWith({
          productId: `product-${category}`,
          name: undefined,
          description: undefined,
          price: 10.99,
          category
        })
      }
    })
  })

  describe('when handling errors', () => {
    it('should throw error when use case fails', async () => {
      const productId = 'product-123'
      const body = {
        name: 'Invalid Product',
        price: -10
      }

      mockEditProduct.execute.mockResolvedValue(
        left(new Error('Invalid price'))
      )

      await expect(sut.handle(productId, body)).rejects.toThrow()

      expect(mockEditProduct.execute).toHaveBeenCalledWith({
        productId: 'product-123',
        name: 'Invalid Product',
        description: undefined,
        price: -10,
        category: undefined
      })
    })

    it('should handle use case execution errors', async () => {
      const productId = 'product-456'
      const body = {
        name: 'Test Product',
        price: 10.99
      }

      mockEditProduct.execute.mockRejectedValue(new Error('Database error'))

      await expect(sut.handle(productId, body)).rejects.toThrow(
        'Database error'
      )
    })
  })

  describe('when validating input parameters', () => {
    it('should handle empty product ID', async () => {
      const productId = ''
      const body = {
        name: 'Test Product',
        price: 10.99
      }

      const updatedProduct = makeProduct({
        name: 'Test Product',
        description: 'Test description',
        price: 10.99,
        category: Category.create('Lanche')
      })

      mockEditProduct.execute.mockResolvedValue(
        right({ product: updatedProduct })
      )

      const result = await sut.handle(productId, body)

      expect(result.product).toBeDefined()
      expect(mockEditProduct.execute).toHaveBeenCalledWith({
        productId: '',
        name: 'Test Product',
        description: undefined,
        price: 10.99,
        category: undefined
      })
    })

    it('should handle empty body parameters', async () => {
      const productId = 'product-123'
      const body = { price: 10.99 }

      const originalProduct = makeProduct({
        name: 'Original Product',
        description: 'Original description',
        price: 10.99,
        category: Category.create('Lanche')
      })

      mockEditProduct.execute.mockResolvedValue(
        right({ product: originalProduct })
      )

      const result = await sut.handle(productId, body)

      expect(result.product).toBeDefined()
      expect(mockEditProduct.execute).toHaveBeenCalledWith({
        productId: 'product-123',
        name: undefined,
        description: undefined,
        price: 10.99,
        category: undefined
      })
    })
  })

  describe('when processing price values', () => {
    it('should handle string price values', async () => {
      const productId = 'product-123'
      const body = {
        price: 25.5
      }

      const updatedProduct = makeProduct({
        name: 'Test Product',
        description: 'Test description',
        price: 25.5,
        category: Category.create('Lanche')
      })

      mockEditProduct.execute.mockResolvedValue(
        right({ product: updatedProduct })
      )

      const result = await sut.handle(productId, body)

      expect(result.product.price).toBe(25.5)
      expect(mockEditProduct.execute).toHaveBeenCalledWith({
        productId: 'product-123',
        name: undefined,
        description: undefined,
        price: 25.5,
        category: undefined
      })
    })

    it('should handle integer price values', async () => {
      const productId = 'product-456'
      const body = {
        price: 30
      }

      const updatedProduct = makeProduct({
        name: 'Test Product',
        description: 'Test description',
        price: 30,
        category: Category.create('Lanche')
      })

      mockEditProduct.execute.mockResolvedValue(
        right({ product: updatedProduct })
      )

      const result = await sut.handle(productId, body)

      expect(result.product.price).toBe(30)
      expect(mockEditProduct.execute).toHaveBeenCalledWith({
        productId: 'product-456',
        name: undefined,
        description: undefined,
        price: 30,
        category: undefined
      })
    })
  })

  describe('when handling edge cases', () => {
    it('should handle very long product names', async () => {
      const productId = 'product-123'
      const longName = 'A'.repeat(1000)
      const body = {
        name: longName,
        price: 10.99
      }

      const updatedProduct = makeProduct({
        name: longName,
        description: 'Test description',
        price: 10.99,
        category: Category.create('Lanche')
      })

      mockEditProduct.execute.mockResolvedValue(
        right({ product: updatedProduct })
      )

      const result = await sut.handle(productId, body)

      expect(result.product.name).toBe(longName)
    })

    it('should handle special characters in description', async () => {
      const productId = 'product-456'
      const body = {
        description: 'Produto com caracteres especiais: áéíóú çãõ ñ',
        price: 10.99
      }

      const updatedProduct = makeProduct({
        name: 'Test Product',
        description: 'Produto com caracteres especiais: áéíóú çãõ ñ',
        price: 10.99,
        category: Category.create('Lanche')
      })

      mockEditProduct.execute.mockResolvedValue(
        right({ product: updatedProduct })
      )

      const result = await sut.handle(productId, body)

      expect(result.product.description).toBe(
        'Produto com caracteres especiais: áéíóú çãõ ñ'
      )
    })
  })
})
