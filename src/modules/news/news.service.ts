import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { News, NewsDocument } from './schema/news.schema';
import {
  UpdateNewsDto,
  GetOneNewsDto,
  DeleteNewsDto,
  AddNewsDto,
  GetNewsListDto,
} from './dto/news.dto';
import { AppType } from 'src/shared/enums/app-type.enum';
import {
  AddingModelException,
  ModelDataNotFoundByIdException,
} from 'src/common/errors/model/model-based.exceptions';
import {
  generateUniqueNewsSlug,
  generateUniqueSlug,
} from 'src/common/helpers/generate-slug';
import { universalSearchQuery } from 'src/common/helpers/universal-search-query';
import { getFilteredResultsWithTotal } from 'src/common/helpers/universal-query-builder';

@Injectable()
export class NewsService {
  constructor(@InjectModel(News.name) private newsModel: Model<NewsDocument>) {}

  async getNewsList(body: GetNewsListDto, appType: string, lang?: string) {
    if (appType === AppType.ADMIN) {
      const [data, total] = await getFilteredResultsWithTotal(
        body,
        this.newsModel,
        [
          'titleUz',
          'titleRu',
          'titleEn',
          'slugUz',
          'slugRu',
          'slugEn',
          'shortDescUz',
          'shortDescRu',
          'shortDescEn',
          'contentUz',
          'contentRu',
          'contentEn',
          'createdAt',
          'updatedAt'
        ],
      );

      return {
        data,
        total,
        pages: body.limit ? Math.ceil(total / body.limit) : 1,
      };
    }
    const sort: Record<string, any> = { createdAt: -1 };
    const limit = body.limit ? body.limit : 12;
    const skip = body.page ? (body.page - 1) * limit : 0;
    let match: Record<string, any> = {};
    match.isDeleted = false;
    match.status = 1;
    const searchPayload = await universalSearchQuery(body.search, [
      'titleUz',
      'titleRu',
      'titleEn',
      'slugUz',
      'slugRu',
      'slugEn',
      'shortDescUz',
      'shortDescRu',
      'shortDescEn',
      'contentUz',
      'contentRu',
      'contentEn'
    ]);
    match = Object.assign(match, searchPayload);
    const [data, total] = await Promise.all([
      await this.newsModel.aggregate([
        {
          $match: match,
        },
        {
          $project: {
            title: {
              $getField: {
                field: `title${lang}`,
                input: '$$ROOT',
              },
            },
            shortDesc: {
              $getField: {
                field: `shortDesc${lang}`,
                input: '$$ROOT',
              },
            },
            slug: {
              $getField: {
                field: `slug${lang}`,
                input: '$$ROOT',
              },
            },
            imageUrl: 1,
            createdAt: 1,
          },
        },
        {
          $sort: sort,
        },
        {
          $skip: skip,
        },
        {
          $limit: limit,
        },
      ]),
      await this.newsModel.countDocuments(match),
    ]);

    return {
      data: data,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  async create(body: AddNewsDto) {
    try {
      const { titleUz, titleRu, titleEn } = body;
      const slugUz = generateUniqueNewsSlug(titleUz);
      const slugRu = generateUniqueNewsSlug(titleRu);
      const slugEn = generateUniqueNewsSlug(titleEn);

      const createBody = {
        ...body,
        slugUz,
        slugRu,
        slugEn,
      };

      await this.newsModel.create(createBody);
    } catch (err) {
      console.log(`adding News ====>  ${err}`);
      throw new AddingModelException();
    }
  }

  async update(updateBody: UpdateNewsDto) {
    const findNews = await this.newsModel.findById(updateBody._id);
    if (!findNews) {
      throw new ModelDataNotFoundByIdException('News not found');
    }

    const { titleUz, titleRu, titleEn } = updateBody;
    const slugUz = findNews.titleUz !== titleUz ? generateUniqueNewsSlug(titleUz) : null;
    const slugRu = findNews.titleRu !== titleRu ? generateUniqueNewsSlug(titleRu) : null;
    const slugEn = findNews.titleEn !== titleEn ? generateUniqueNewsSlug(titleEn) : null;

    const forUpdateBody = {
      ...updateBody,
      ...(slugUz && { slugUz }),
      ...(slugRu && { slugRu }),
      ...(slugEn && { slugEn }),
    };

    await this.newsModel.findByIdAndUpdate(updateBody._id, {
      $set: forUpdateBody,
    });
  }

  async getOneNews(body: GetOneNewsDto, appType: string, lang?: string) {
    let match: Record<string, any> = {};
    if (!body._id && !body.slug) {
      return {};
    }

    if (body._id) {
      match._id = body._id;
    }

    if (body.slug) {
      const searchPayload = await universalSearchQuery(body.slug, [
        'slugUz',
        'slugRu',
        'slugEn',
      ]);
      match = Object.assign(match, searchPayload);
    }

    if (appType === AppType.ADMIN) {
      return await this.newsModel.findOne(match).lean();
    }

    const data = await this.newsModel.aggregate([
      {
        $match: match,
      },
      {
        $project: {
          title: {
            $getField: {
              field: `title${lang}`,
              input: '$$ROOT',
            },
          },
          shortDesc: {
            $getField: {
              field: `shortDesc${lang}`,
              input: '$$ROOT',
            },
          },
          content: {
            $getField: {
              field: `content${lang}`,
              input: '$$ROOT',
            },
          },
          imageUrl: 1,
          createdAt: 1,
        },
      },
    ]);
    return data.length ? data[0] : {};
  }

  async delete(body: DeleteNewsDto) {
    const findNews = await this.newsModel.findOne({
      _id: body._id,
      isDeleted: false,
    });

    if (!findNews) throw new NotFoundException("Can't delete. News not found");

    await this.newsModel.findByIdAndUpdate(body._id, {
      $set: { isDeleted: true },
    });
  }
}
