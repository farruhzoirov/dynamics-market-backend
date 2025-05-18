import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  AddFaqDto,
  UpdateFaqDto,
  GetFaqListDto,
  DeleteFaqDto,
  FaqOrderItemDto,
  GetFaqDto,
  UpdateFaqsOrderDto,
} from './dto/faq.dto';
import { Faq, FaqDocument } from './schema/faq.schema';
import { AppType } from 'src/shared/enums/app-type.enum';
import { timeStamp } from 'console';

@Injectable()
export class FaqService {
  constructor(
    @InjectModel(Faq.name) private readonly faqModel: Model<FaqDocument>,
  ) {}

  async getFaqList(appType: string, lang?: string) {
    if (appType === AppType.ADMIN) {
      return await this.faqModel
        .find({ isDeleted: false })
        .sort({ index: 1 })
        .lean();
    }

    const data = await this.faqModel.aggregate([
      {
        $match: {
          isDeleted: false,
          status: 1,
        },
      },
      {
        $project: {
          question: {
            $getField: { field: `question${lang}`, input: '$$ROOT' },
          },
          answer: { $getField: { field: `answer${lang}`, input: '$$ROOT' } },
          index: 1,
        },
      },
      {
        $sort: { index: 1 },
      },
    ]);

    return data;
  }

  async create(body: AddFaqDto) {
    const count = await this.faqModel.countDocuments({ isDeleted: false });
    await this.faqModel.create({
      ...body,
      index: count,
    });
  }

  async getFaqById(body: GetFaqDto, appType: string, lang?: string) {
    if (appType === AppType.ADMIN) {
      return await this.faqModel
        .findOne({ _id: body._id, isDeleted: false })
        .lean();
    }

    const data = await this.faqModel
      .findOne({ _id: body._id, isDeleted: false })
      .select(`question${lang} answer${lang} index`)
      .lean();

    return data;
  }

  async update(updateBody: UpdateFaqDto) {
    const findFaq = await this.faqModel.findOne({
      _id: updateBody._id,
      isDeleted: false,
    });
    if (!findFaq) throw new NotFoundException('Faq not found');

    await this.faqModel.findByIdAndUpdate(updateBody._id, {
      $set: updateBody,
    });
  }

  async updateFaqsOrder(body: UpdateFaqsOrderDto) {
    const bulkOps = body.orders.map(({ _id, index }) => ({
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
