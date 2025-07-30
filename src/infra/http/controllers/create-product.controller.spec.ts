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
    const mockProduct = {
      id: 'product-1',
      name: 'X-Burger',
      description: 'Delicious burger',
      price: 15.99,
      category: 'Lanche'
    }

    mockCreateProductUseCase.execute.mockResolvedValue({
      isRight: () => true,
      value: { product: mockProduct }
    })

    const result = await sut.handle({
      name: 'X-Burger',
      description: 'Delicious burger',
      price: 15.99,
      category: 'Lanche'
    })

    expect(result.statusCode).toBe(201)
    expect(result.body).toEqual({ product: mockProduct })
    expect(mockCreateProductUseCase.execute).toHaveBeenCalledWith({
      name: 'X-Burger',
      description: 'Delicious burger',
      price: 15.99,
      category: 'Lanche'
    })
  })

  it('should return error when use case fails', async () => {
    mockCreateProductUseCase.execute.mockResolvedValue({
      isRight: () => false,
      value: { message: 'Invalid price' }
    })

    const result = await sut.handle({
      name: 'X-Burger',
      description: 'Delicious burger',
      price: -10,
      category: 'Lanche'
    })

    expect(result.statusCode).toBe(400)
    expect(result.body).toEqual({ message: 'Invalid price' })
  })
})
