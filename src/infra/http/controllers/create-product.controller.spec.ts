import { left, right } from '@/core/either'
import { Category } from '@/domain/fastfood/enterprise/entities/value-objects'
import { makeProduct } from 'test/factories/make-product'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreateProductController } from './create-product.controller'

describe('Create Product Controller', () => {
  let sut: CreateProductController
  let mockCreateProductUseCase: any

  beforeEach(() => {
    mockCreateProductUseCase = {
      execute: vi.fn()
    }

    sut = new CreateProductController(mockCreateProductUseCase)
  })

  it('should be able to create a product', async () => {
    const product = makeProduct({
      name: 'X-Burger',
      description: 'Delicious burger',
      price: 15.99,
      category: Category.create('Lanche')
    })

    mockCreateProductUseCase.execute.mockResolvedValue(right({ product }))

    const result = await sut.handle({
      name: 'X-Burger',
      description: 'Delicious burger',
      price: 15.99,
      category: 'Lanche'
    })

    expect(result).toEqual({
      product: {
        id: product.id.toString(),
        name: 'X-Burger',
        description: 'Delicious burger',
        price: 15.99,
        category: 'Lanche'
      }
    })

    expect(mockCreateProductUseCase.execute).toHaveBeenCalledWith({
      name: 'X-Burger',
      description: 'Delicious burger',
      price: 15.99,
      category: 'Lanche'
    })
  })

  it('should return error when use case fails', async () => {
    mockCreateProductUseCase.execute.mockResolvedValue(
      left(new Error('Invalid price'))
    )

    await expect(
      sut.handle({
        name: 'X-Burger',
        description: 'Delicious burger',
        price: -10,
        category: 'Lanche'
      })
    ).rejects.toThrow()

    expect(mockCreateProductUseCase.execute).toHaveBeenCalledWith({
      name: 'X-Burger',
      description: 'Delicious burger',
      price: -10,
      category: 'Lanche'
    })
  })
})
