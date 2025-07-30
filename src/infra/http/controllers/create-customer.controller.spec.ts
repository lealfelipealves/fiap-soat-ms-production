import { left, right } from '@/core/either'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CreateCustomerController } from './create-customer.controller'

describe('Create Customer Controller', () => {
  let sut: CreateCustomerController
  let mockCreateCustomerUseCase: any

  beforeEach(() => {
    mockCreateCustomerUseCase = {
      execute: vi.fn()
    }

    sut = new CreateCustomerController(mockCreateCustomerUseCase)
  })

  it('should be able to create a customer', async () => {
    const mockCustomer = {
      id: 'customer-1',
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '123.456.789-01'
    }

    mockCreateCustomerUseCase.execute.mockResolvedValue(
      right({ customer: mockCustomer })
    )

    const result = await sut.handle('12345678901', {
      name: 'John Doe',
      email: 'john@example.com'
    })

    expect(result).toEqual({
      customer: {
        id: 'customer-1',
        name: 'John Doe',
        email: 'john@example.com',
        cpf: '123.456.789-01'
      }
    })

    expect(mockCreateCustomerUseCase.execute).toHaveBeenCalledWith({
      cpf: '12345678901',
      name: 'John Doe',
      email: 'john@example.com'
    })
  })

  it('should return error when use case fails', async () => {
    mockCreateCustomerUseCase.execute.mockResolvedValue(
      left(new Error('Invalid email'))
    )

    await expect(
      sut.handle('12345678901', {
        name: 'John Doe',
        email: 'invalid-email'
      })
    ).rejects.toThrow()

    expect(mockCreateCustomerUseCase.execute).toHaveBeenCalledWith({
      cpf: '12345678901',
      name: 'John Doe',
      email: 'invalid-email'
    })
  })
})
