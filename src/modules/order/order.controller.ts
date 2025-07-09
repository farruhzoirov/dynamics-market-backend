import {
  Body,
  Controller,
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
import { BaseController } from '../../common/base/base.controller';
import { Request } from 'express';

@Controller('order')
@ApiBearerAuth()
@UsePipes(new ValidationPipe({ whitelist: true }))
export class OrderController extends BaseController {
  constructor(private orderService: OrderService) {
    super();
  }
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
  // @Get('amocrm')
  // async getOrderCode() {
  //   const response = await this.orderService.createCustomFieldForOrders();
  //   return response;
  // }
  @HttpCode(HttpStatus.OK)
  @Post('list')
  async getOrdersList(
    @Body() body: GetOrdersDto,
    @User() user: IJwtPayload,
    @Req() req: Request,
  ) {
    const { lang, appType } = this.extractHeadersInfo(req);

    return await this.handleListRequest(
      body,
      lang,
      appType,
      (body) => this.orderService.getOrdersList(body),
      (lang) => this.orderService.getOrdersByUserId(body, user, lang),
    );
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
    const orderCode = await this.orderService.create(body, user);
    const response = new AddedSuccessResponse();
    return {
      ...response,
      orderCode: orderCode,
    };
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
