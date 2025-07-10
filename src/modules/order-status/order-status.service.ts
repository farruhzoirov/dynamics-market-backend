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
  GetOrderStatusListDto,
  UpdateOrderStatusDto,
  UpdateOrderStatusIndexDto,
} from './dto/order-status.dto';
import { DefaultCreateOrderStatusNames } from '../../shared/enums/order-status.enum';
import { universalSearchQuery } from '../../common/helpers/universal-search-query';

@Injectable()
export class OrderStatusService {
  constructor(
    @InjectModel(OrderStatus.name)
    private readonly orderStatusModel: Model<OrderStatusDocument>,
  ) {}

  async getOrderStatusList(body: GetOrderStatusListDto) {
    const limit = body.limit ? body.limit : 12;
    const skip = body.page ? (body.page - 1) * limit : 0;
    let search = {};
    if (body.search) {
      search = await universalSearchQuery(body?.search, [
        'nameUz',
        'nameRu',
        'nameEn',
      ]);
    }
    const orderStatusList = await this.orderStatusModel
      .find(search)
      .select('-__v')
      .skip(skip)
      .sort({ index: 1 })
      .limit(limit);
    return orderStatusList;
  }

  async addOrderStatus(body: AddOrderStatusDto) {
    try {
      const count = await this.orderStatusModel.countDocuments();
      await this.orderStatusModel.create({
        ...body,
        index: count,
      });
    } catch (err) {
      if (err.code === 'E11000') {
        throw new BadRequestException(
          'Order status already exists. Duplicate name.',
        );
      }
    }
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
    try {
      const id = body._id;
      const findOrderStatus = await this.orderStatusModel.findById(body._id);

      if (!findOrderStatus) {
        throw new NotFoundException('Order status not found');
      }

      if (findOrderStatus.static) {
        throw new BadRequestException("Can't update it");
      }

      delete body._id;
      await this.orderStatusModel.findByIdAndUpdate(id, { $set: body });
    } catch (err) {
      if (err.code === 'E11000') {
        throw new BadRequestException(
          'Order status already exists. Duplicate name.',
        );
      }
    }
  }

  async deleteOrderStatus(body: DeleteOrderStatusDto) {
    const findOrderStatus = await this.orderStatusModel.findById(body._id);

    if (!findOrderStatus) {
      throw new NotFoundException('Order status not found');
    }
    if (findOrderStatus.static) {
      throw new BadRequestException("Can't delete it");
    }

    await this.orderStatusModel.findByIdAndDelete(body._id);
  }

  async returnOrCreateOrderStatus() {
    const [findOrderStatus, findAll, count] = await Promise.all([
      this.orderStatusModel.findOne({
        nameUz: DefaultCreateOrderStatusNames.nameUz,
      }),
      this.orderStatusModel.find(),
      this.orderStatusModel.countDocuments(),
    ]);

    if (findOrderStatus) {
      return findOrderStatus;
    }

    if (!findOrderStatus && !findAll.length) {
      await new this.orderStatusModel({
        nameUz: DefaultCreateOrderStatusNames.nameUz,
        nameRu: DefaultCreateOrderStatusNames.nameRu,
        nameEn: DefaultCreateOrderStatusNames.nameEn,
        static: true,
        index: 0,
      }).save();
    }
    await new this.orderStatusModel({
      nameUz: DefaultCreateOrderStatusNames.nameUz,
      nameRu: DefaultCreateOrderStatusNames.nameRu,
      nameEn: DefaultCreateOrderStatusNames.nameEn,
      static: true,
      index: count,
    }).save();
  }
}
