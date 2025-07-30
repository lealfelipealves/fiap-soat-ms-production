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
      cpf: '12345678901'
    }

    mockCreateCustomerUseCase.execute.mockResolvedValue({
      isRight: () => true,
      value: { customer: mockCustomer }
    })

    const result = await sut.handle({
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '12345678901'
    })

    expect(result.statusCode).toBe(201)
    expect(result.body).toEqual({ customer: mockCustomer })
    expect(mockCreateCustomerUseCase.execute).toHaveBeenCalledWith({
      name: 'John Doe',
      email: 'john@example.com',
      cpf: '12345678901'
    })
  })

  it('should return error when use case fails', async () => {
    mockCreateCustomerUseCase.execute.mockResolvedValue({
      isRight: () => false,
      value: { message: 'Invalid email' }
    })

    const result = await sut.handle({
      name: 'John Doe',
      email: 'invalid-email',
      cpf: '12345678901'
    })

    expect(result.statusCode).toBe(400)
    expect(result.body).toEqual({ message: 'Invalid email' })
  })
})
