import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { OrderStatus, OrderStatusDocument } from './schema/order-status.model';
import { Model } from 'mongoose';
import {
  AddOrderStatusDto,
  DeleteOrderStatusDto,
  UpdateOrderStatusDto,
  UpdateOrderStatusIndexDto,
} from './dto/order-status.dto';
import { DefaultOrderStatuses } from '../../shared/enums/order-status.enum';

@Injectable()
export class OrderStatusService {
  constructor(
    @InjectModel(OrderStatus.name)
    private readonly orderStatusModel: Model<OrderStatusDocument>,
  ) {}

  async getOrderStatusList() {
    const orderStatusList = await this.orderStatusModel
      .find()
      .sort({ index: 1 });
    return orderStatusList;
  }

  async addOrderStatus(body: AddOrderStatusDto) {
    const isExistOrderStatusName = await this.orderStatusModel.exists({
      name: body.name,
    });

    if (isExistOrderStatusName) {
      throw new BadRequestException('Order status already exist.');
    }

    const count = await this.orderStatusModel.countDocuments();
    await this.orderStatusModel.create({
      ...body,
      index: count,
    });
  }

  async updateOrderStatusIndex(body: UpdateOrderStatusIndexDto) {
    const bulkOps = body.indexes.map(({ _id, index }) => ({
      updateOne: {
        filter: { _id },
        update: { $set: { index: index } },
      },
    }));

    return this.orderStatusModel.bulkWrite(bulkOps);
  }

  async updateOrderStatus(body: UpdateOrderStatusDto) {
    const id = body._id;
    const [findOrderStatus, isExistOrderStatusName] = await Promise.all([
      this.orderStatusModel.findById(body._id),
      this.orderStatusModel.exists({
        name: body?.name,
        _id: { $ne: body._id },
      }),
    ]);

    if (!findOrderStatus) {
      throw new NotFoundException('Order status not found');
    }

    if (
      body.name &&
      Object.values(DeleteOrderStatusDto).includes(findOrderStatus.name)
    ) {
      throw new BadRequestException("Can't update it");
    }

    if (isExistOrderStatusName) {
      throw new BadRequestException(
        'Order status with this name already exists',
      );
    }

    delete body._id;
    await this.orderStatusModel.findByIdAndUpdate(id, { $set: body });
  }

  async deleteOrderStatus(body: DeleteOrderStatusDto) {
    const findOrderStatus = await this.orderStatusModel.findById(body._id);

    if (!findOrderStatus) {
      throw new NotFoundException('Order status not found');
    }
    const statusName = findOrderStatus.name.toLowerCase();
    if (
      Object.values(DefaultOrderStatuses).includes(
        statusName as DefaultOrderStatuses,
      )
    ) {
      throw new BadRequestException("Can't delete it");
    }

    await this.orderStatusModel.findByIdAndDelete(body._id);
  }

  async returnOrCreateOrderStatus(status: string) {
    const [findOrderStatus, findAll, count] = await Promise.all([
      this.orderStatusModel.findOne({
        name: status,
      }),
      this.orderStatusModel.find(),
      this.orderStatusModel.countDocuments(),
    ]);

    if (findOrderStatus) {
      return findOrderStatus;
    }

    if (!findOrderStatus && !findAll.length) {
      await new this.orderStatusModel({
        name: status,
        index: 0,
      }).save();
    }
    await new this.orderStatusModel({
      name: status,
      index: count,
    }).save();
  }
}
