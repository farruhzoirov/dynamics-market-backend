import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import {
  CreateOrderDto,
  DeleteOrderDto,
  GetOrderDto,
  GetOrdersDto,
  UpdateOrderDto,
} from './dto/order.dto';
import { User } from 'src/common/decorators/user.decarator';
import { IJwtPayload } from 'src/shared/interfaces/jwt-payload';
import { OrderService } from './order.service';
import { ApiBearerAuth, ApiHeaders } from '@nestjs/swagger';
import {
  AddedSuccessResponse,
  DeletedSuccessResponse,
  UpdatedSuccessResponse,
} from 'src/shared/success/success-responses';
import { AcceptLanguagePipe } from 'src/common/pipes/language.pipe';
import { AcceptAppTypePipe } from 'src/common/pipes/app-type.pipe';
import { AppType } from 'src/shared/enums/app-type.enum';

@Controller('order')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ whitelist: true }))
export class OrderController {
  constructor(private orderService: OrderService) {}
  @ApiHeaders([
    {
      name: 'Accept-Language',
      enum: ['uz', 'ru', 'en'],
      description: 'Tilni ko‘rsatish kerak: uz, ru yoki en',
      required: false,
    },
    {
      name: 'App-Type',
      enum: ['admin', 'user'],
      description: 'App Type ko‘rsatish kerak: admin yoki user',
      required: false,
    },
  ])
  @HttpCode(HttpStatus.OK)
  @Post('list')
  async getOrdersList(
    @Body() body: GetOrdersDto,
    @User() user: IJwtPayload,
    @Req() req: Request,
  ) {
    let lang = req.headers['accept-language'] as string;
    let appType = req.headers['app-type'] as string;
    lang = new AcceptLanguagePipe().transform(lang);
    appType = new AcceptAppTypePipe().transform(appType);
    let data;
    if (appType === AppType.ADMIN) {
      data = await this.orderService.getOrdersList(body);
      return data;
    }
    if (appType === AppType.USER) {
      data = await this.orderService.getOrdersByUserId(body, user, lang);
      return data;
    }
    return data;
  }

  @HttpCode(HttpStatus.OK)
  @Post('get-order')
  async getOrder(
    @Body() body: GetOrderDto,
    @User() user: IJwtPayload,
    @Req() req: Request,
  ) {
    let lang = req.headers['accept-language'] as string;
    lang = new AcceptLanguagePipe().transform(lang);
    const data = await this.orderService.getOrder(body, user, lang);
    return data;
  }

  @Post('create')
  async createOrder(@Body() body: CreateOrderDto, @User() user: IJwtPayload) {
    await this.orderService.create(body, user);
    return new AddedSuccessResponse();
  }

  @HttpCode(HttpStatus.OK)
  @Post('update')
  async updateOrder(@Body() body: UpdateOrderDto) {
    await this.orderService.update(body);
    return new UpdatedSuccessResponse();
  }

  @HttpCode(HttpStatus.OK)
  @Post('delete')
  async deleteOrder(@Body() body: DeleteOrderDto) {
    await this.orderService.delete(body);
    return new DeletedSuccessResponse();
  }
}
