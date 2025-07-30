import { CreateCustomerUseCase } from '@/domain/fastfood/application/use-cases/create-customer'
import { CreateProductUseCase } from '@/domain/fastfood/application/use-cases/create-product'
import { DeleteProductUseCase } from '@/domain/fastfood/application/use-cases/delete-product'
import { EditProductUseCase } from '@/domain/fastfood/application/use-cases/edit-product'
import { GetAllOrderUseCase } from '@/domain/fastfood/application/use-cases/get-all-order'
import { GetCustomerByCpfUseCase } from '@/domain/fastfood/application/use-cases/get-customer-by-cpf'
import { GetProductByCategoryUseCase } from '@/domain/fastfood/application/use-cases/get-product-by-category'
import { UpdateOrderStatusUseCase } from '@/domain/fastfood/application/use-cases/update-order-status'
import { Module } from '@nestjs/common'
import { DatabaseModule } from '../database/database.module'
import { CreateCustomerController } from './controllers/create-customer.controller'
import { CreateProductController } from './controllers/create-product.controller'
import { DeleteProductController } from './controllers/delete-product.controller'
import { EditProductController } from './controllers/edit-product.controller'
import { GetCustomerByCpfController } from './controllers/get-customer-by-cpf.controller'
import { GetProductByCategoryController } from './controllers/get-product-by-category.controller'
import { GetProductionOrderDetailsController } from './controllers/get-production-order-details.controller'
import { GetProductionQueueController } from './controllers/get-production-queue.controller'
import { MarkOrderReadyController } from './controllers/mark-order-ready.controller'
import { PaymentApprovedController } from './controllers/payment-approved.controller'
import { UpdateProductionStatusController } from './controllers/update-production-status.controller'
import { MicroserviceCommunicationService } from './services/microservice-communication.service'

@Module({
  imports: [DatabaseModule],
  controllers: [
    GetCustomerByCpfController,
    CreateCustomerController,
    GetProductByCategoryController,
    CreateProductController,
    EditProductController,
    DeleteProductController,
    GetProductionQueueController,
    GetProductionOrderDetailsController,
    MarkOrderReadyController,
    PaymentApprovedController,
    UpdateProductionStatusController
  ],
  providers: [
    GetCustomerByCpfUseCase,
    CreateCustomerUseCase,
    CreateProductUseCase,
    EditProductUseCase,
    DeleteProductUseCase,
    GetAllOrderUseCase,
    GetProductByCategoryUseCase,
    UpdateOrderStatusUseCase,
    MicroserviceCommunicationService
  ]
})
export class HttpModule {}
