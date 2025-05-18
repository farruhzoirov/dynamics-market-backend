import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AddFaqDto,
  UpdateFaqDto,
  GetFaqListDto,
  DeleteFaqDto,
  FaqOrderItemDto,
} from './dto/faq.dto';
import { Faq, FaqDocument } from './schema/faq.schema';
import { AppType } from 'src/shared/enums/app-type.enum';

@Injectable()
export class FaqService {
  constructor(
    @InjectModel(Faq.name) private readonly faqModel: Model<FaqDocument>,
  ) {}

  async getFaqList(appType: string, lang?: string) {
    if (appType === AppType.ADMIN) {
      return await this.faqModel.find().sort({ index: 1 }).lean();
    }

    const data = await this.faqModel
      .find()
      .sort({ index: 1 })
      .select(`question${lang} answer${lang} index`)
      .lean();

    return data;
  }

  async create(body: AddFaqDto) {
    const count = await this.faqModel.countDocuments({ isDeleted: false });
    await this.faqModel.create({
      ...body,
      index: count,
    });
  }

  async update(body: UpdateFaqDto) {
    const findFaq = await this.faqModel.findOne({
      _id: body._id,
      isDeleted: false,
    });
    if (!findFaq) throw new NotFoundException('Faq not found');

    const { order, ...updateBody } = body;

    if (order?.length) {
      await this.updateFaqsOrder(order);
    }

    await this.faqModel.findByIdAndUpdate(body._id, {
      $set: updateBody,
    });
  }

  async updateFaqsOrder(orders: FaqOrderItemDto[]) {
    const bulkOps = orders.map(({ _id, index }) => ({
      updateOne: {
        filter: { _id },
        update: { $set: { index: index } },
      },
    }));

    return this.faqModel.bulkWrite(bulkOps);
  }

  async delete(body: DeleteFaqDto) {
    const findFaq = await this.faqModel.findOne({
      _id: body._id,
      isDeleted: false,
    });

    if (!findFaq) throw new NotFoundException("Can't delete. Faq not found");

    await this.faqModel.findByIdAndUpdate(body._id, {
      $set: { isDeleted: true },
    });
  }
}
