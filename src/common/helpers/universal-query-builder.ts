import {universalSearchQuery} from "./universal-search-query";

export const universalQueryBuilder = async (
    body,
    currentModel,
    searchFields: string[],
    parentModelName: string
) => {
  const payload = {
    page: body?.page ? body.page : 1,
    limit: body?.limit ? body.limit : null,
    select: body?.select ? body.select.split(",") : null,
    search: body?.search || null,
  }
  const skip = (payload.page - 1) * payload.limit;
  const filter = await universalSearchQuery(payload.search, searchFields);

  if (body.parentId) {
    filter[parentModelName] = body.parentId;
  }
  return await currentModel.find(filter)
      .skip(skip)
      .limit(payload.limit)
      .select(payload.select ? payload.select : "-__v")
      .lean();
}

