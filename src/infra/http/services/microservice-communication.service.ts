import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'

export interface Order {
  id: string
  customerId: string
  status: string
  paymentStatus: string
  createdAt: Date
  updatedAt: Date
}

export interface Customer {
  id: string
  name: string
  email: string
  cpf: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
}

@Injectable()
export class MicroserviceCommunicationService {
  private readonly orderServiceUrl: string
  private readonly paymentServiceUrl: string

  constructor(private configService: ConfigService) {
    this.orderServiceUrl =
      this.configService.get('ORDER_SERVICE_URL') || 'http://localhost:3333'
    this.paymentServiceUrl =
      this.configService.get('PAYMENT_SERVICE_URL') || 'http://localhost:3334'
  }

  async getOrderById(orderId: string): Promise<Order> {
    try {
      const response = await fetch(`${this.orderServiceUrl}/order/${orderId}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new HttpException('Pedido não encontrado', HttpStatus.NOT_FOUND)
        }
        throw new HttpException(
          'Erro ao buscar pedido',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      }

      const data = await response.json()
      return data.order
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        'Erro de comunicação com microserviço de pedidos',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getCustomerByCpf(cpf: string): Promise<Customer> {
    try {
      const response = await fetch(`${this.orderServiceUrl}/customers/${cpf}`)

      if (!response.ok) {
        if (response.status === 404) {
          throw new HttpException(
            'Cliente não encontrado',
            HttpStatus.NOT_FOUND
          )
        }
        throw new HttpException(
          'Erro ao buscar cliente',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      }

      const data = await response.json()
      return data.customer
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        'Erro de comunicação com microserviço de pedidos',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async getProductById(productId: string): Promise<Product> {
    try {
      const response = await fetch(
        `${this.orderServiceUrl}/products/${productId}`
      )

      if (!response.ok) {
        if (response.status === 404) {
          throw new HttpException(
            'Produto não encontrado',
            HttpStatus.NOT_FOUND
          )
        }
        throw new HttpException(
          'Erro ao buscar produto',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      }

      const data = await response.json()
      return data.product
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        'Erro de comunicação com microserviço de pedidos',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async updateOrderStatus(orderId: string, status: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.orderServiceUrl}/orders/${orderId}/status`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            status
          })
        }
      )

      if (!response.ok) {
        throw new HttpException(
          'Erro ao atualizar status do pedido',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        'Erro de comunicação com microserviço de pedidos',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }

  async notifyPaymentService(orderId: string, status: string): Promise<void> {
    try {
      const response = await fetch(
        `${this.paymentServiceUrl}/orders/${orderId}/production-status`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            orderId,
            status
          })
        }
      )

      if (!response.ok) {
        throw new HttpException(
          'Erro ao notificar microserviço de pagamento',
          HttpStatus.INTERNAL_SERVER_ERROR
        )
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error
      }
      throw new HttpException(
        'Erro de comunicação com microserviço de pagamento',
        HttpStatus.INTERNAL_SERVER_ERROR
      )
    }
  }
}
