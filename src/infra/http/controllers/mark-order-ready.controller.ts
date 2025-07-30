import { Body, Controller, Param, Post } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { MicroserviceCommunicationService } from '../services/microservice-communication.service'

interface MarkOrderReadyBody {
  notes?: string
  readyTime?: string
}

@ApiTags('Produção')
@Controller('/production')
export class MarkOrderReadyController {
  constructor(
    private microserviceCommunication: MicroserviceCommunicationService
  ) {}

  @Post('/orders/:orderId/ready')
  @ApiOperation({
    summary: 'Marcar pedido como pronto para entrega'
  })
  async handle(
    @Param('orderId') orderId: string,
    @Body() body: MarkOrderReadyBody
  ) {
    const { notes, readyTime } = body

    // Atualizar status para "pronto" no microserviço de pedidos
    await this.microserviceCommunication.updateOrderStatus(orderId, 'ready')

    // Notificar microserviço de pagamento sobre o pedido pronto
    await this.microserviceCommunication.notifyPaymentService(orderId, 'ready')

    return {
      message: 'Pedido marcado como pronto para entrega',
      orderId,
      status: 'ready',
      notes,
      readyTime: readyTime || new Date().toISOString(),
      updatedAt: new Date()
    }
  }
}
