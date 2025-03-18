import {IUniversalQuery} from 'src/shared/interfaces/query-based';
import {universalSearchQuery} from './universal-search-query';
import {Model} from 'mongoose';

export const getFilteredResultsWithTotal = async (
    body: IUniversalQuery,
    currentModel: Model<any>,
    searchFields: string[],
    selectedFields?: string,
) => {
  const payload = {
    page: body?.page ? body.page : 1,
    limit: body?.limit ? body.limit : 0,
    select: body?.select ? body?.select : null,
    search: body?.search || null,
  };
  const skip = (payload.page - 1) * payload.limit;
  const filter: Record<string, any> = await universalSearchQuery(
      payload.search,
      searchFields as string[],
  );

  filter.isDeleted = false;

  if (body.parentId || body.parentId === null) {
    filter.parentId = body.parentId;
  }

  if (body.categoryId) {
    filter.hierarchy = body.categoryId;
  }

  if (body.brandId) {
    filter.brandId = body.brandId;
  }

  // const lang = 'Uz';

  // const pipeline = [
  //   {$match: filter},
  //   {$skip: skip},
  //   {$limit: payload.limit},
  //   {
  //     $project: {
  //       nameUz: 1,
  //       nameRu: 1,
  //       nameEn: 1,
  //       hierarchy: {
  //         $map: {
  //           input: '$hierarchy',
  //           as: 'category',
  //           in: {
  //             categoryId: '$$category.categoryId',
  //             [`categorySlug${lang}`]: `$$category.categorySlug${lang}`,
  //             [`categoryName${lang}`]: `$$category.categoryName${lang}`,
  //           },
  //         },
  //       },
  //     },
  //   },
  // ];
  //
  // const products = await currentModel.aggregate(pipeline).exec();
  // console.log(products[0].hierarchy);

  return await Promise.all([
    await currentModel
        .find(filter)
        .skip(skip)
        .limit(payload.limit)
        .select(selectedFields || payload.select ? payload.select : '-__v')
        .lean()
        .exec(),
    await currentModel.countDocuments(filter),
  ]);
};
