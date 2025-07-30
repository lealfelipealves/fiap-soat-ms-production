import { left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DeleteProductController } from './delete-product.controller'

describe('DeleteProductController', () => {
  let sut: DeleteProductController
  let mockDeleteProduct: any

  beforeEach(() => {
    mockDeleteProduct = {
      execute: vi.fn()
    }

    sut = new DeleteProductController(mockDeleteProduct)
  })

  describe('when deleting a product', () => {
    it('should delete product successfully', async () => {
      const productId = 'product-123'

      mockDeleteProduct.execute.mockResolvedValue(right(null))

      await expect(sut.handle(productId)).resolves.toBeUndefined()

      expect(mockDeleteProduct.execute).toHaveBeenCalledWith({
        productId: 'product-123'
      })
    })

    it('should handle different product IDs', async () => {
      const productIds = ['product-1', 'product-abc', 'product-xyz-123']

      for (const productId of productIds) {
        mockDeleteProduct.execute.mockResolvedValue(right(null))

        await expect(sut.handle(productId)).resolves.toBeUndefined()

        expect(mockDeleteProduct.execute).toHaveBeenCalledWith({
          productId
        })
      }
    })

    it('should handle UUID format product IDs', async () => {
      const productId = '550e8400-e29b-41d4-a716-446655440000'

      mockDeleteProduct.execute.mockResolvedValue(right(null))

      await expect(sut.handle(productId)).resolves.toBeUndefined()

      expect(mockDeleteProduct.execute).toHaveBeenCalledWith({
        productId: '550e8400-e29b-41d4-a716-446655440000'
      })
    })
  })

  describe('when handling errors', () => {
    it('should throw error when use case fails', async () => {
      const productId = 'product-123'

      mockDeleteProduct.execute.mockResolvedValue(
        left(new ResourceNotFoundError())
      )

      await expect(sut.handle(productId)).rejects.toThrow()

      expect(mockDeleteProduct.execute).toHaveBeenCalledWith({
        productId: 'product-123'
      })
    })

    it('should handle use case execution errors', async () => {
      const productId = 'product-456'

      mockDeleteProduct.execute.mockRejectedValue(new Error('Database error'))

      await expect(sut.handle(productId)).rejects.toThrow('Database error')
    })

    it('should handle product not found error', async () => {
      const productId = 'non-existent-product'

      mockDeleteProduct.execute.mockResolvedValue(
        left(new ResourceNotFoundError())
      )

      await expect(sut.handle(productId)).rejects.toThrow()

      expect(mockDeleteProduct.execute).toHaveBeenCalledWith({
        productId: 'non-existent-product'
      })
    })
  })

  describe('when validating input parameters', () => {
    it('should handle empty product ID', async () => {
      const productId = ''

      mockDeleteProduct.execute.mockResolvedValue(right(null))

      await expect(sut.handle(productId)).resolves.toBeUndefined()

      expect(mockDeleteProduct.execute).toHaveBeenCalledWith({
        productId: ''
      })
    })

    it('should handle very long product ID', async () => {
      const productId = 'A'.repeat(1000)

      mockDeleteProduct.execute.mockResolvedValue(right(null))

      await expect(sut.handle(productId)).resolves.toBeUndefined()

      expect(mockDeleteProduct.execute).toHaveBeenCalledWith({
        productId: 'A'.repeat(1000)
      })
    })

    it('should handle product ID with special characters', async () => {
      const productId = 'product-123!@#$%^&*()'

      mockDeleteProduct.execute.mockResolvedValue(right(null))

      await expect(sut.handle(productId)).resolves.toBeUndefined()

      expect(mockDeleteProduct.execute).toHaveBeenCalledWith({
        productId: 'product-123!@#$%^&*()'
      })
    })
  })

  describe('when handling edge cases', () => {
    it('should handle null product ID', async () => {
      const productId = null as any

      mockDeleteProduct.execute.mockResolvedValue(right(null))

      await expect(sut.handle(productId)).resolves.toBeUndefined()

      expect(mockDeleteProduct.execute).toHaveBeenCalledWith({
        productId: null
      })
    })

    it('should handle undefined product ID', async () => {
      const productId = undefined as any

      mockDeleteProduct.execute.mockResolvedValue(right(null))

      await expect(sut.handle(productId)).resolves.toBeUndefined()

      expect(mockDeleteProduct.execute).toHaveBeenCalledWith({
        productId: undefined
      })
    })

    it('should handle numeric product ID as string', async () => {
      const productId = '123'

      mockDeleteProduct.execute.mockResolvedValue(right(null))

      await expect(sut.handle(productId)).resolves.toBeUndefined()

      expect(mockDeleteProduct.execute).toHaveBeenCalledWith({
        productId: '123'
      })
    })
  })

  describe('when verifying HTTP response', () => {
    it('should return 204 status code (no content)', async () => {
      const productId = 'product-123'

      mockDeleteProduct.execute.mockResolvedValue(right(null))

      const result = await sut.handle(productId)

      expect(result).toBeUndefined()
    })

    it('should not return any data on successful deletion', async () => {
      const productId = 'product-456'

      mockDeleteProduct.execute.mockResolvedValue(right(null))

      const result = await sut.handle(productId)

      expect(result).toBeUndefined()
    })
  })
})
