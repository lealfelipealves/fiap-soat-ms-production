import { GetAllOrderUseCase } from '@/domain/fastfood/application/use-cases/get-all-order'
import { Controller, Get, Query } from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'

interface GetProductionQueueQuery {
  status?: string
  limit?: number
}

@ApiTags('Produção')
@Controller('/production')
export class GetProductionQueueController {
  constructor(private getAllOrder: GetAllOrderUseCase) {}

  @Get('/queue')
  @ApiOperation({
    summary: 'Listar fila de pedidos para produção (visão da cozinha)'
  })
  async handle(@Query() query: GetProductionQueueQuery) {
    const result = await this.getAllOrder.execute()

    if (result.isLeft()) {
      throw new Error('Erro ao buscar fila de produção')
    }

    let orders = result.value.orders

    // Filtrar por status se especificado
    if (query.status) {
      orders = orders.filter(
        (order) => order.status?.getValue() === query.status
      )
    }

    // Ordenar por data de criação (mais antigos primeiro)
    orders = orders.sort(
      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
    )

    // Limitar quantidade se especificado
    if (query.limit) {
      orders = orders.slice(0, query.limit)
    }

    return {
      queue: orders.map((order) => ({
        id: order.id.toString(),
        customerId: order.customerId.toString(),
        status: order.status?.getValue(),
        paymentStatus: order.paymentStatus?.getValue(),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        products: order.products.getItems().map((product) => ({
          id: product.id.toString(),
          productId: product.productId.toString()
        }))
      })),
      total: orders.length
    }
  }
}
