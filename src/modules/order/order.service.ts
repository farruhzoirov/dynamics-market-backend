import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateOrderDto,
  DeleteOrderDto,
  GetOrderDto,
  GetOrdersDto,
  UpdateOrderDto,
} from './dto/order.dto';
import { IJwtPayload } from 'src/shared/interfaces/jwt-payload';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schema/order.model';
import { Model } from 'mongoose';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { ProductItem } from 'src/shared/interfaces/product-items';
import { Counter, CounterDocument } from './schema/counter.model';
import { getFilteredResultsWithTotal } from 'src/common/helpers/universal-query-builder';
import {
  buildCartItemsPipeline,
  buildSingleOrderPipeline,
  buildUserOrdersPipeline,
} from 'src/common/helpers/pipelines/order.pipeline';
import { ConnectAmocrmService } from 'src/shared/module/amocrm/connect-amocrm.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
    private readonly connectAmocrmService: ConnectAmocrmService,
  ) {}

  async addOrderFieldsToLead(leadId: number, orderData: any) {
    try {
      const client = this.connectAmocrmService.getClient();
      const response = await client.request.patch(`/api/v4/leads/${leadId}`, {
        custom_fields_values: [
          {
            field_id: 590867, // "Order Code" field_id
            values: [{ value: orderData.orderCode }],
          },
          {
            field_id: 590875, // "firstName" field_id
            values: [{ value: orderData.firstName }],
          },
          {
            field_id: 590877, // "lastName" field_id
            values: [{ value: orderData.lastName }],
          },
          {
            field_id: 590931, // "lastName" field_id
            values: [{ value: orderData.email }],
          },
        ],
      });

      console.log('✅ Lead updated with custom fields:', response.data);
      return response.data;
    } catch (error) {
      console.error(
        '❌ Error updating lead with custom fields:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async createLead() {
    try {
      const client = this.connectAmocrmService.getClient();
      const customBody = {
        orderCode: 'ORD-003',
        firstName: 'Ogabek',
        lastName: 'Sultonbayev',
        email: 'sultonbayevogabek@gmail.com',
      };

      const response = (await client.request.post('/api/v4/leads', [
        {
          name: `${customBody.firstName} ${customBody.lastName} ${customBody.email}`, // Lead nomi
        },
      ])) as any;

      const leadId = response.data._embedded.leads[0].id; // Yaratilgan lead ID
      const data = await this.addOrderFieldsToLead(leadId, {
        orderCode: 'ORD-003',
        firstName: 'Ogabek',
        lastName: 'Sultonbayev',
        email: 'sultonbayevogabek@gmail.com',
      });
      return data;
    } catch (error) {
      console.error(
        '❌ Error creating lead:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async createCustomFieldForOrders() {
    try {
      // const client = this.connectAmocrmService.getClient();
      // const response = await client.request.post(
      //   '/api/v4/leads/custom_fields',
      //   [
      //     {
      //       name: 'Email', // Custom field nomi
      //       type: 'text', // Maydon turi (text, number, date va boshqalar)
      //       sort: 10, // Maydonning tartib raqami
      //     },
      //   ],
      // );
      const response = await this.createLead();

      console.log('✅ Custom field created for orders:', response);
      return response;
    } catch (error) {
      console.error(
        '❌ Error creating custom field for orders:',
        error.response?.data || error.message,
      );
      throw error;
    }
  }

  async getOrdersList(body: GetOrdersDto) {
    const [data, total] = await getFilteredResultsWithTotal(
      body,
      this.orderModel,
      ['orderCode', 'firstName', 'lastName'],
    );

    return {
      data,
      total,
    };
  }

  async getOrdersByUserId(body: GetOrdersDto, user: IJwtPayload, lang: string) {
    const sort: Record<string, any> = { createdAt: -1 };
    const limit = body.limit ? body.limit : 12;
    const skip = body.page ? (body.page - 1) * limit : 0;
    const userId = user._id;
    const pipeline = await buildUserOrdersPipeline(
      userId,
      lang,
      sort,
      skip,
      limit,
    );
    const [findOrders, total] = await Promise.all([
      await this.orderModel.aggregate(pipeline),
      await this.orderModel.countDocuments({
        userId: userId,
        isDeleted: false,
      }),
    ]);
    return {
      data: findOrders,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async getOrder(body: GetOrderDto, user: IJwtPayload, lang: string) {
    if (!body._id && !body.orderCode) {
      throw new BadRequestException('order Id or orderCode is required');
    }
    const match: Record<string, string | boolean> = {};
    const orderMap = [
      { bodyKey: '_id', matchKey: '_id' },
      { bodyKey: 'orderCode', matchKey: 'orderCode' },
    ];
    match.userId = user._id;
    match.isDeleted = false;
    orderMap.forEach(({ bodyKey, matchKey }) => {
      if (body[bodyKey]) {
        match[matchKey] = body[bodyKey];
      }
    });
    const pipeline = await buildSingleOrderPipeline(match, lang);
    const findOrder = await this.orderModel.aggregate(pipeline);
    return findOrder.length ? findOrder[0] : null;
  }

  async create(body: CreateOrderDto, user: IJwtPayload) {
    const userId = user._id;
    const findCart = await this.cartModel.findOne({ userId });

    if (!findCart) {
      throw new BadRequestException('Error creating order, Cart not found');
    }

    const pipeline = await buildCartItemsPipeline(userId);
    const cartItems = await this.cartModel.aggregate(pipeline);

    if (!cartItems.length) {
      throw new BadRequestException('Error creating order, Cart may be empty');
    }
    const orderCode = await this.getNextOrderCode();

    const items: ProductItem[] = cartItems.map((item) => ({
      productId: item.product._id.toString(),
      nameUz: item.product.nameUz,
      nameRu: item.product.nameRu,
      nameEn: item.product.nameEn,
      quantity: item.quantity,
      price: item.product.currentPrice ?? null,
    }));

    const [createdOrder] = await Promise.all([
      await this.orderModel.create({
        ...body,
        orderCode,
        userId,
        items,
      }),
      await this.cartModel.deleteMany({ userId }),
    ]);
    return createdOrder.orderCode;
  }

  async update(body: UpdateOrderDto) {
    const findOrder = await this.orderModel.findById(body._id);

    if (!findOrder) {
      throw new BadRequestException('Order not found');
    }

    await this.orderModel.findByIdAndUpdate(body._id, {
      $set: body,
    });
  }

  async delete(body: DeleteOrderDto) {
    const findOrder = await this.orderModel.findById(body._id);
    if (!findOrder) {
      throw new BadRequestException('Order not found');
    }

    await this.orderModel.findByIdAndUpdate(body._id, { isDeleted: true });
  }

  async getNextOrderCode(): Promise<string> {
    const counter = await this.counterModel.findOneAndUpdate(
      { name: 'order' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true },
    );

    const code = counter.seq.toString().padStart(4, '0');
    return code;
  }
}
