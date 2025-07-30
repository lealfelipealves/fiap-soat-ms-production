import { Body, Controller, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { MicroserviceCommunicationService } from '../services/microservice-communication.service'

interface PaymentApprovedBody {
  orderId: string
  status: string
}

@ApiTags('Produção')
@Controller('/orders')
export class PaymentApprovedController {
  constructor(
    private microserviceCommunication: MicroserviceCommunicationService
  ) {}

  @Post('/:id/payment-approved')
  @ApiOperation({
    summary:
      'Receber notificação de pagamento aprovado (comunicação entre microserviços)'
  })
  async handle(@Body() body: PaymentApprovedBody) {
    try {
      // Buscar informações do pedido no microserviço de pedidos
      await this.microserviceCommunication.getOrderById(body.orderId)

      // Atualizar status do pedido para "em preparação"
      await this.microserviceCommunication.updateOrderStatus(
        body.orderId,
        'preparing'
      )

      // Notificar o microserviço de pagamento sobre o início da preparação
      await this.microserviceCommunication.notifyPaymentService(
        body.orderId,
        'preparing'
      )

      return {
        message: 'Pedido iniciado para preparação',
        orderId: body.orderId,
        status: 'preparing'
      }
    } catch {
      throw new Error('Erro ao processar notificação de pagamento aprovado')
    }
  }
}
