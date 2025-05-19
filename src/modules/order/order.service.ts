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
import { OrderStatus } from '../../shared/enums/order-status.enum';
import { CustomerType } from '../../shared/enums/customer-type.enum';

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
            // field_id: 590867, // "Order Code" field_id
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
          {
            field_id: 594417, // "Items" field_id (masalan, 594001)
            values: [{ value: JSON.stringify(orderData.items) }], // JSON string sifatida
          },
          {
            field_id: 594421, // "Comment" field_id
            values: [{ value: orderData.comment || "" }],
          },
          {
            field_id: 594665,
            values: [{ value: orderData.customerType }],
          },
          {
            field_id: 594885, // "Company Name" field_id
            values: [{ value: orderData.companyName || "" }],
          },
          {
            field_id: 594887, // "Phone" field_id
            values: [{ value: orderData.phone }],
          },
          {
            field_id: 594891, // "Is Deleted" field_id
            values: [{ value: orderData.isDeleted }],
          },
          {
            field_id: 594889, // "Is Deleted" field_id
            values: [{ value: orderData.status }],
          },
        ],

      });
      const leads = await client.request.get(`/api/v4/leads`);
      const customFields = await client.request.get(`/api/v4/leads/custom_fields`);

      console.log('✅ Lead updated with custom fields:', response.data);
      return {
        response: response.data,
        leads: leads.data,
        customFields: customFields.data,
      };
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
        items: [{
            productId: "66f8a1b2c3d4e5f678901235",
            nameUz: "Naushniklar",
            nameRu: "Наушники",
            nameEn: "Headphones",
            price : 49.99,
            quantity: 1
        }]
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

      const dummyOrderCancelled: any = {
        firstName: "Jasur",
        lastName: "Karimov",
        email: "jasur.karimov@example.com",
        userId: "987656",
        items: [
          {
            productId: "66f8a1b2c3d4e5f678901237",
            nameUz: "Planshet",
            nameRu: "Планшет",
            nameEn: "Tablet",
            quantity: 1,
            price: null, // Narx belgilanmagan
          },
        ],
        orderCode: "ORD-2025-003",
        comment: "Mijoz buyurtmani bekor qildi.",
        customerType: CustomerType.INDIVIDUAL,
        companyName: null,
        phone: "+998909876543",
        status: 1,
        isDeleted: true,
      };
      return dummyOrderCancelled;
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
    console.time('OrdersService');
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
    console.timeEnd('OrdersService');
    console.log('OrdersService');
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
