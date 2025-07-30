import { UpdateOrderStatusUseCase } from '@/domain/fastfood/application/use-cases/update-order-status'
import { Body, Controller, Param, Patch } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { MicroserviceCommunicationService } from '../services/microservice-communication.service'

interface UpdateProductionStatusBody {
  status: string
  notes?: string
}

@ApiTags('Produção')
@Controller('/production')
export class UpdateProductionStatusController {
  constructor(
    private updateOrderStatus: UpdateOrderStatusUseCase,
    private microserviceCommunication: MicroserviceCommunicationService
  ) {}

  @Patch('/orders/:orderId/status')
  @ApiOperation({
    summary: 'Atualizar status de produção de um pedido'
  })
  async handle(
    @Param('orderId') orderId: string,
    @Body() body: UpdateProductionStatusBody
  ) {
    const { status, notes } = body

    // Atualizar status no microserviço de pedidos
    await this.microserviceCommunication.updateOrderStatus(orderId, status)

    // Notificar microserviço de pagamento sobre mudança de status
    await this.microserviceCommunication.notifyPaymentService(orderId, status)

    return {
      message: 'Status de produção atualizado com sucesso',
      orderId,
      status,
      notes,
      updatedAt: new Date()
    }
  }
}
