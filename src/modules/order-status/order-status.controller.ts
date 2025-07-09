import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { OrderStatusService } from './order-status.service';
import {
  AddOrderStatusDto,
  DeleteOrderStatusDto,
  UpdateOrderStatusDto,
  UpdateOrderStatusIndexDto,
} from './dto/order-status.dto';
import {
  AddedSuccessResponse,
  DeletedSuccessResponse,
  UpdatedSuccessResponse,
} from '../../shared/success/success-responses';
import { Roles } from '../../common/decorators/roles.decarator';
import { UserRole } from '../../shared/enums/roles.enum';

@Controller('order-status')
export class OrderStatusController {
  constructor(private readonly orderStatusService: OrderStatusService) {}

  @HttpCode(HttpStatus.OK)
  @Post('list')
  @Roles(UserRole.superAdmin, UserRole.admin)
  async getOrderStatusList() {
    return this.orderStatusService.getOrderStatusList();
  }

  @Post('add')
  @Roles(UserRole.superAdmin, UserRole.admin)
  async addOrderStatusList(@Body() body: AddOrderStatusDto) {
    await this.orderStatusService.addOrderStatus(body);
    return new AddedSuccessResponse();
  }

  @HttpCode(HttpStatus.OK)
  @Post('update')
  @Roles(UserRole.superAdmin, UserRole.admin)
  async updateOrderStatusList(@Body() updateBody: UpdateOrderStatusDto) {
    await this.orderStatusService.updateOrderStatus(updateBody);
    return new UpdatedSuccessResponse();
  }

  @Roles(UserRole.superAdmin, UserRole.admin)
  @HttpCode(HttpStatus.OK)
  @Post('update-index')
  async updateFaqsOrder(@Body() body: UpdateOrderStatusIndexDto) {
    await this.orderStatusService.updateOrderStatusIndex(body);
    return new UpdatedSuccessResponse('updated successfully');
  }

  @Roles(UserRole.superAdmin, UserRole.admin)
  @HttpCode(HttpStatus.OK)
  @Post('delete')
  async deleteOrderStatusList(@Body() body: DeleteOrderStatusDto) {
    await this.orderStatusService.deleteOrderStatus(body);
    return new DeletedSuccessResponse();
  }
}
