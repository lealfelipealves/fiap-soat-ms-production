import { left, right } from '@/core/either'
import { ResourceNotFoundError } from '@/core/errors/errors/resource-not-found-error'
import { Cpf } from '@/domain/fastfood/enterprise/entities/value-objects'
import { makeCustomer } from 'test/factories/make-customer'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetCustomerByCpfController } from './get-customer-by-cpf.controller'

describe('GetCustomerByCpfController', () => {
  let sut: GetCustomerByCpfController
  let mockGetCustomerByCpf: any

  beforeEach(() => {
    mockGetCustomerByCpf = {
      execute: vi.fn()
    }

    sut = new GetCustomerByCpfController(mockGetCustomerByCpf)
  })

  describe('when getting customer by CPF', () => {
    it('should return customer data for valid CPF', async () => {
      const cpf = '24178530003'
      const customer = makeCustomer({
        cpf: Cpf.create('24178530003'),
        name: 'John Doe',
        email: 'john@example.com'
      })

      mockGetCustomerByCpf.execute.mockResolvedValue(right({ customer }))

      const result = await sut.handle(cpf)

      expect(result).toEqual({
        customer: {
          id: customer.id.toString(),
          name: 'John Doe',
          email: 'john@example.com',
          cpf: '241.785.300-03'
        }
      })

      expect(mockGetCustomerByCpf.execute).toHaveBeenCalledWith({
        cpf: '24178530003'
      })
    })

    it('should handle formatted CPF input', async () => {
      const cpf = '241.785.300-03'
      const customer = makeCustomer({
        cpf: Cpf.create('24178530003'),
        name: 'Jane Smith',
        email: 'jane@example.com'
      })

      mockGetCustomerByCpf.execute.mockResolvedValue(right({ customer }))

      const result = await sut.handle(cpf)

      expect(result.customer.name).toBe('Jane Smith')
      expect(result.customer.email).toBe('jane@example.com')
      expect(mockGetCustomerByCpf.execute).toHaveBeenCalledWith({
        cpf: '241.785.300-03'
      })
    })

    it('should handle different CPF formats', async () => {
      const cpfFormats = ['24178530003', '241.785.300-03']

      for (const cpf of cpfFormats) {
        const customer = makeCustomer({
          cpf: Cpf.create('24178530003'),
          name: 'Test Customer',
          email: 'test@example.com'
        })

        mockGetCustomerByCpf.execute.mockResolvedValue(right({ customer }))

        const result = await sut.handle(cpf)

        expect(result.customer).toBeDefined()
        expect(mockGetCustomerByCpf.execute).toHaveBeenCalledWith({
          cpf
        })
      }
    })
  })

  describe('when handling errors', () => {
    it('should throw ResourceNotFoundError when use case fails', async () => {
      const cpf = '12345678901'

      mockGetCustomerByCpf.execute.mockResolvedValue(
        left(new ResourceNotFoundError())
      )

      await expect(sut.handle(cpf)).rejects.toThrow(ResourceNotFoundError)

      expect(mockGetCustomerByCpf.execute).toHaveBeenCalledWith({
        cpf: '12345678901'
      })
    })

    it('should throw ResourceNotFoundError when customer is null', async () => {
      const cpf = '98765432100'

      mockGetCustomerByCpf.execute.mockResolvedValue(right({ customer: null }))

      await expect(sut.handle(cpf)).rejects.toThrow(ResourceNotFoundError)

      expect(mockGetCustomerByCpf.execute).toHaveBeenCalledWith({
        cpf: '98765432100'
      })
    })

    it('should handle use case execution errors', async () => {
      const cpf = '11122233344'

      mockGetCustomerByCpf.execute.mockRejectedValue(
        new Error('Database error')
      )

      await expect(sut.handle(cpf)).rejects.toThrow('Database error')
    })
  })

  describe('when validating input parameters', () => {
    it('should handle empty CPF parameter', async () => {
      const cpf = ''

      mockGetCustomerByCpf.execute.mockResolvedValue(right({ customer: null }))

      await expect(sut.handle(cpf)).rejects.toThrow(ResourceNotFoundError)

      expect(mockGetCustomerByCpf.execute).toHaveBeenCalledWith({
        cpf: ''
      })
    })

    it('should handle invalid CPF format', async () => {
      const cpf = 'invalid-cpf'

      mockGetCustomerByCpf.execute.mockResolvedValue(
        left(new ResourceNotFoundError())
      )

      await expect(sut.handle(cpf)).rejects.toThrow(ResourceNotFoundError)

      expect(mockGetCustomerByCpf.execute).toHaveBeenCalledWith({
        cpf: 'invalid-cpf'
      })
    })
  })

  describe('when processing customer data', () => {
    it('should correctly format customer presenter data', async () => {
      const cpf = '24178530003'
      const customer = makeCustomer({
        cpf: Cpf.create('24178530003'),
        name: 'Alice Johnson',
        email: 'alice@example.com'
      })

      mockGetCustomerByCpf.execute.mockResolvedValue(right({ customer }))

      const result = await sut.handle(cpf)

      expect(result.customer).toEqual({
        id: customer.id.toString(),
        name: 'Alice Johnson',
        email: 'alice@example.com',
        cpf: '241.785.300-03'
      })
    })

    it('should handle customer with different data types', async () => {
      const cpf = '98765432100'
      const customer = makeCustomer({
        cpf: Cpf.create('98765432100'),
        name: 'Bob Wilson',
        email: 'bob@example.com'
      })

      mockGetCustomerByCpf.execute.mockResolvedValue(right({ customer }))

      const result = await sut.handle(cpf)

      expect(typeof result.customer.id).toBe('string')
      expect(typeof result.customer.name).toBe('string')
      expect(typeof result.customer.email).toBe('string')
      expect(typeof result.customer.cpf).toBe('string')
    })
  })

  describe('when handling edge cases', () => {
    it('should handle very long CPF strings', async () => {
      const cpf = '12345678901234567890'

      mockGetCustomerByCpf.execute.mockResolvedValue(
        left(new ResourceNotFoundError())
      )

      await expect(sut.handle(cpf)).rejects.toThrow(ResourceNotFoundError)
    })
  })
})
