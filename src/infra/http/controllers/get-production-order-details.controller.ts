import { GetAllOrderUseCase } from '@/domain/fastfood/application/use-cases/get-all-order'
import { Controller, Get, Param } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { MicroserviceCommunicationService } from '../services/microservice-communication.service'

@ApiTags('Produção')
@Controller('/production')
export class GetProductionOrderDetailsController {
  constructor(
    private getAllOrder: GetAllOrderUseCase,
    private microserviceCommunication: MicroserviceCommunicationService
  ) {}

  @Get('/orders/:orderId/details')
  @ApiOperation({
    summary: 'Obter detalhes de um pedido específico na produção'
  })
  async handle(@Param('orderId') orderId: string) {
    const result = await this.getAllOrder.execute()

    if (result.isLeft()) {
      throw new Error('Erro ao buscar pedidos')
    }

    const order = result.value.orders.find((o) => o.id.toString() === orderId)

    if (!order) {
      throw new Error('Pedido não encontrado')
    }

    // Buscar informações do cliente
    const customer = await this.microserviceCommunication.getCustomerByCpf(
      order.customerId.toString()
    )

    // Buscar informações dos produtos
    const productIds = order.products
      .getItems()
      .map((product) => product.productId.toString())

    const products = await Promise.all(
      productIds.map((productId) =>
        this.microserviceCommunication.getProductById(productId)
      )
    )

    return {
      order: {
        id: order.id.toString(),
        customerId: order.customerId.toString(),
        status: order.status?.getValue(),
        paymentStatus: order.paymentStatus?.getValue(),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      },
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        cpf: customer.cpf
      },
      products: products.map((product) => ({
        id: product.id,
        name: product.name,
        description: product.description,
        price: product.price,
        category: product.category
      })),
      productionInfo: {
        estimatedTime: this.calculateEstimatedTime(products),
        priority: this.calculatePriority(order.createdAt),
        notes: this.generateProductionNotes(products)
      }
    }
  }

  private calculateEstimatedTime(products: any[]): number {
    // Lógica para calcular tempo estimado baseado nos produtos
    const baseTime = 10 // minutos base
    const timePerProduct = 5 // minutos por produto
    return baseTime + products.length * timePerProduct
  }

  private calculatePriority(createdAt: Date): string {
    const timeWaiting = Date.now() - createdAt.getTime()
    const minutesWaiting = timeWaiting / (1000 * 60)

    if (minutesWaiting > 30) return 'Alta'
    if (minutesWaiting > 15) return 'Média'
    return 'Baixa'
  }

  private generateProductionNotes(products: any[]): string[] {
    const notes: string[] = []

    products.forEach((product) => {
      if (product.category === 'Bebidas') {
        notes.push(`Preparar ${product.name} gelado`)
      } else if (product.category === 'Sobremesas') {
        notes.push(`Manter ${product.name} refrigerado`)
      } else {
        notes.push(`Preparar ${product.name} conforme padrão`)
      }
    })

    return notes
  }
}
