import { describe, expect, it } from 'vitest'
import { PaymentStatus } from './payment-status'

describe('PaymentStatus Value Object', () => {
  describe('when creating a payment status', () => {
    it('should create a valid approved status', () => {
      const paymentStatus = PaymentStatus.create('Aprovado')

      expect(paymentStatus.getValue()).toBe('Aprovado')
      expect(paymentStatus.toString()).toBe('Aprovado')
      expect(paymentStatus.toValue()).toBe('Aprovado')
    })

    it('should create a valid rejected status', () => {
      const paymentStatus = PaymentStatus.create('Recusado')

      expect(paymentStatus.getValue()).toBe('Recusado')
    })

    it('should create a valid pending status', () => {
      const paymentStatus = PaymentStatus.create('Pendente')

      expect(paymentStatus.getValue()).toBe('Pendente')
    })

    it('should throw an error for an invalid payment status', () => {
      expect(() => PaymentStatus.create('InvalidStatus')).toThrowError(
        'Invalid payment status: InvalidStatus'
      )
    })
  })

  describe('when comparing payment statuses', () => {
    it('should return true when comparing same status values', () => {
      const status1 = PaymentStatus.create('Aprovado')
      const status2 = PaymentStatus.create('Aprovado')

      expect(status1.equals(status2)).toBe(true)
    })

    it('should return false when comparing different status values', () => {
      const status1 = PaymentStatus.create('Aprovado')
      const status2 = PaymentStatus.create('Recusado')

      expect(status1.equals(status2)).toBe(false)
    })
  })

  describe('when accessing payment status constants', () => {
    it('should have correct constant values', () => {
      expect(PaymentStatus.APPROVED).toBe('Aprovado')
      expect(PaymentStatus.REJECTED).toBe('Recusado')
      expect(PaymentStatus.PENDING).toBe('Pendente')
    })

    it('should have all valid statuses in VALID_STATUS array', () => {
      expect(PaymentStatus.VALID_STATUS).toContain('Aprovado')
      expect(PaymentStatus.VALID_STATUS).toContain('Recusado')
      expect(PaymentStatus.VALID_STATUS).toContain('Pendente')
      expect(PaymentStatus.VALID_STATUS).toHaveLength(3)
    })
  })
})
