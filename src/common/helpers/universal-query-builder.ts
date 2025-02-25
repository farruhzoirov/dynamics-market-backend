import { universalSearchQuery } from './universal-search-query';

export const getFilteredResultsWithTotal = async <T>(
  body: {
    page?: number;
    limit?: number;
    select?: string;
    search?: string;
    parentId?: string;
  },
  currentModel: any,
  searchFields: (keyof T)[],
) => {
  const payload = {
    page: body?.page ? body.page : 1,
    limit: body?.limit ? body.limit : 0,
    select: body?.select ? body.select.split(',') : null,
    search: body?.search || null,
  };
  const skip = (payload.page - 1) * payload.limit;
  const filter: Record<string, any> = await universalSearchQuery(
    payload.search,
    searchFields as string[],
  );
  if (body.parentId || body.parentId === null) {
    filter.parentId = body.parentId;
  }
  return await Promise.all([
    await currentModel
      .find(filter)
      .skip(skip)
      .limit(payload.limit)
      .select(payload.select ? payload.select.join(' ') : '-__v')
      .lean(),
    await currentModel.countDocuments(filter),
  ]);
};
