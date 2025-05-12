import { BadRequestException, Injectable } from '@nestjs/common';
import {
  CreateOrderDto,
  DeleteOrderDto,
  GetAllOrdersDto,
  GetOrderDto,
  UpdateOrderDto,
} from './dto/order.dto';
import { IJwtPayload } from 'src/shared/interfaces/jwt-payload';
import { InjectModel } from '@nestjs/mongoose';
import { Order, OrderDocument } from './schema/order.model';
import { Model } from 'mongoose';
import { Cart, CartDocument } from '../cart/schemas/cart.schema';
import { Product, ProductDocument } from '../product/schemas/product.model';
import { ProductItem } from 'src/shared/interfaces/product-items';
import { Counter, CounterDocument } from './schema/counter.model';
import { getFilteredResultsWithTotal } from 'src/common/helpers/universal-query-builder';

@Injectable()
export class OrderService {
  constructor(
    @InjectModel(Order.name) private orderModel: Model<OrderDocument>,
    @InjectModel(Cart.name) private cartModel: Model<CartDocument>,
    @InjectModel(Product.name) private productModel: Model<ProductDocument>,
    @InjectModel(Counter.name) private counterModel: Model<CounterDocument>,
  ) {}

  async getOrdersList(body: GetAllOrdersDto) {
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

  async getOrdersByUserId(user: IJwtPayload, lang: string) {
    const userId = user._id;
    const findOrders = await this.orderModel.aggregate([
      {
        $match: {
          userId: userId,
          isDeleted: false,
        },
      },
      {
        $project: {
          _id: 1,
          orderCode: 1,
          status: 1,
          items: {
            $map: {
              input: { $ifNull: ['$items', []] },
              as: 'item',
              in: {
                productId: '$$item.productId',
                name: lang ? { $ifNull: [`$$item.name${lang}`, null] } : null,
                quantity: '$$item.quantity',
                price: '$$item.price',
              },
            },
          },
          itemsCount: {
            $size: { $ifNull: ['$items', []] },
          },
        },
      },
    ]);

    return findOrders;
  }

  async getOrder(body: GetOrderDto, user: IJwtPayload, lang: string) {
    if (!body._id && !body.orderCode) {
      throw new BadRequestException('order Id or orderCode is required');
    }
    const match: Record<string, any> = {};
    match.userId = user._id;
    match.isDeleted = false;

    if (body._id) {
      match._id = body._id;
    }

    if (body.orderCode) {
      match.orderCode = body.orderCode;
    }

    const findOrder = await this.orderModel.aggregate([
      {
        $match: match,
      },
      {
        $project: {
          _id: 1,
          orderCode: 1,
          firstName: 1,
          lastName: 1,
          email: 1,
          phone: 1,
          customerType: 1,
          companyName: 1,
          status: 1,
          createdAt: 1,
          items: {
            $map: {
              input: { $ifNull: ['$items', []] },
              as: 'item',
              in: {
                productId: '$$item.productId',
                name: lang ? { $ifNull: [`$$item.name${lang}`, null] } : null,
                quantity: '$$item.quantity',
                price: '$$item.price',
              },
            },
          },
        },
      },
    ]);

    return findOrder.length ? findOrder[0] : null;
  }

  async create(body: CreateOrderDto, user: IJwtPayload) {
    const userId = user._id;

    const findCart = await this.cartModel.findOne({ userId });

    if (!findCart) {
      throw new BadRequestException('Error creating order, Cart not found');
    }

    const orderItems = await this.cartModel.aggregate([
      {
        $match: {
          userId: userId,
        },
      },
      {
        $addFields: {
          productId: { $toObjectId: '$productId' },
        },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: { path: '$product' } },

      {
        $project: {
          quantity: 1,
          product: {
            _id: 1,
            nameUz: 1,
            nameRu: 1,
            nameEn: 1,
            currentPrice: '$product.currentPrice',
          },
        },
      },
    ]);

    if (!orderItems.length) {
      throw new BadRequestException('Error creating order, Cart may be empty');
    }
    const orderCode = await this.getNextOrderCode();
    const items: ProductItem[] = orderItems.map((item) => ({
      productId: item.product._id.toString(),
      nameUz: item.product.nameUz,
      nameRu: item.product.nameRu,
      nameEn: item.product.nameEn,
      quantity: item.quantity,
      price: item.product.currentPrice ?? null,
    }));

    await this.orderModel.create({
      ...body,
      orderCode,
      userId,
      items,
    });
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
