import { left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Category } from '@/domain/fastfood/enterprise/entities/value-objects'
import { makeProduct } from 'test/factories/make-product'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetProductByCategoryController } from './get-product-by-category.controller'

describe('GetProductByCategoryController', () => {
  let sut: GetProductByCategoryController
  let mockGetProductByCategory: any

  beforeEach(() => {
    mockGetProductByCategory = {
      execute: vi.fn()
    }

    sut = new GetProductByCategoryController(mockGetProductByCategory)
  })

  describe('when getting products by category', () => {
    it('should return products for a valid category', async () => {
      const category = 'Lanche'
      const products = [
        makeProduct({
          name: 'X-Burger',
          description: 'Delicious burger',
          price: 15.99,
          category: Category.create('Lanche')
        }),
        makeProduct({
          name: 'X-Salad',
          description: 'Fresh salad',
          price: 12.99,
          category: Category.create('Lanche')
        })
      ]

      mockGetProductByCategory.execute.mockResolvedValue(right({ products }))

      const result = await sut.handle(category)

      expect(result).toEqual({
        products: [
          {
            id: products[0].id.toString(),
            name: 'X-Burger',
            description: 'Delicious burger',
            price: 15.99,
            category: 'Lanche'
          },
          {
            id: products[1].id.toString(),
            name: 'X-Salad',
            description: 'Fresh salad',
            price: 12.99,
            category: 'Lanche'
          }
        ]
      })

      expect(mockGetProductByCategory.execute).toHaveBeenCalledWith({
        category: 'Lanche'
      })
    })

    it('should return empty array when no products found for category', async () => {
      const category = 'Bebida'

      mockGetProductByCategory.execute.mockResolvedValue(
        right({ products: [] })
      )

      const result = await sut.handle(category)

      expect(result).toEqual({ products: [] })
      expect(mockGetProductByCategory.execute).toHaveBeenCalledWith({
        category: 'Bebida'
      })
    })

    it('should handle different valid categories', async () => {
      const categories = ['Lanche', 'Acompanhamento', 'Bebida', 'Sobremesa']

      for (const category of categories) {
        const products = [
          makeProduct({
            name: `Test ${category}`,
            description: `Test description for ${category}`,
            price: 10.99,
            category: Category.create(category)
          })
        ]

        mockGetProductByCategory.execute.mockResolvedValue(right({ products }))

        const result = await sut.handle(category)

        expect(result.products).toHaveLength(1)
        expect(result.products[0].category).toBe(category)
        expect(mockGetProductByCategory.execute).toHaveBeenCalledWith({
          category
        })
      }
    })
  })

  describe('when handling errors', () => {
    it('should throw ResourceNotFoundError when use case fails', async () => {
      const category = 'InvalidCategory'

      mockGetProductByCategory.execute.mockResolvedValue(
        left(new ResourceNotFoundError())
      )

      await expect(sut.handle(category)).rejects.toThrow(ResourceNotFoundError)

      expect(mockGetProductByCategory.execute).toHaveBeenCalledWith({
        category: 'InvalidCategory'
      })
    })

    it('should handle use case execution errors', async () => {
      const category = 'Lanche'

      mockGetProductByCategory.execute.mockRejectedValue(
        new Error('Database error')
      )

      await expect(sut.handle(category)).rejects.toThrow('Database error')
    })
  })

  describe('when validating input parameters', () => {
    it('should handle empty category parameter', async () => {
      const category = ''

      mockGetProductByCategory.execute.mockResolvedValue(
        right({ products: [] })
      )

      const result = await sut.handle(category)

      expect(result.products).toEqual([])
      expect(mockGetProductByCategory.execute).toHaveBeenCalledWith({
        category: ''
      })
    })

    it('should handle case-sensitive category matching', async () => {
      const category = 'LANCHE'

      mockGetProductByCategory.execute.mockResolvedValue(
        right({ products: [] })
      )

      const result = await sut.handle(category)

      expect(result.products).toEqual([])
      expect(mockGetProductByCategory.execute).toHaveBeenCalledWith({
        category: 'LANCHE'
      })
    })
  })

  describe('when processing product data', () => {
    it('should correctly format product presenter data', async () => {
      const category = 'Bebida'
      const product = makeProduct({
        name: 'Coca-Cola',
        description: 'Refrigerante',
        price: 5.99,
        category: Category.create('Bebida')
      })

      mockGetProductByCategory.execute.mockResolvedValue(
        right({ products: [product] })
      )

      const result = await sut.handle(category)

      expect(result.products[0]).toEqual({
        id: product.id.toString(),
        name: 'Coca-Cola',
        description: 'Refrigerante',
        price: 5.99,
        category: 'Bebida'
      })
    })

    it('should handle multiple products with different properties', async () => {
      const category = 'Sobremesa'
      const products = [
        makeProduct({
          name: 'Sorvete',
          description: 'Sorvete de chocolate',
          price: 8.99,
          category: Category.create('Sobremesa')
        }),
        makeProduct({
          name: 'Pudim',
          description: 'Pudim de leite',
          price: 6.99,
          category: Category.create('Sobremesa')
        })
      ]

      mockGetProductByCategory.execute.mockResolvedValue(right({ products }))

      const result = await sut.handle(category)

      expect(result.products).toHaveLength(2)
      expect(result.products[0].name).toBe('Sorvete')
      expect(result.products[1].name).toBe('Pudim')
    })
  })
})
