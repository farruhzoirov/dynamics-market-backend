import { IUniversalQuery } from 'src/shared/interfaces/query-based';
import { universalSearchQuery } from './universal-search-query';
import { Model } from 'mongoose';

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
  let filter: Record<string, any> = {};
  if (payload.search) {
    filter = await universalSearchQuery(
      payload.search,
      searchFields as string[],
    );
  }

  filter.isDeleted = false;

  if (body.parentId || body.parentId === null) {
    filter.parentId = body.parentId;
  }

  if (body.categoryId) {
    filter.hierarchyPath = body.categoryId;
  }

  if (body.brandId) {
    filter.brandId = body.brandId;
  }
  return await Promise.all([
    await currentModel
      .find(filter)
      .skip(skip)
      .limit(payload.limit)
      .select(selectedFields)
      .lean()
      .exec(),
    await currentModel.countDocuments(filter),
  ]);
};
