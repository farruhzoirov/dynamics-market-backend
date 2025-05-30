import { PipelineStage } from 'mongoose';

export async function buildProductPipeline(
  match: any,
  sort: Record<string, 1 | -1>,
  lang: string,
  limit: number | null,
  skip: number,
): Promise<PipelineStage[]> {
  const pipeline: PipelineStage[] = [
    {
      $match: match,
    },
    {
      $lookup: {
        from: 'brands',
        localField: 'brandId',
        foreignField: '_id',
        as: 'brand',
      },
    },
    {
      $unwind: {
        path: '$brand',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        name: lang ? { $ifNull: [`$name${lang}`, null] } : null,
        description: lang ? { $ifNull: [`$description${lang}`, null] } : null,
        slug: lang ? { $ifNull: [`$slug${lang}`, null] } : null,
        attributes: {
          $map: {
            input: { $ifNull: ['$attributes', []] },
            as: 'attribute',
            in: {
              name: lang
                ? { $ifNull: [`$$attribute.name${lang}`, null] }
                : null,
              value: lang
                ? { $ifNull: [`$$attribute.value${lang}`, null] }
                : null,
            },
          },
        },
        sku: 1,
        oldPrice: 1,
        currentPrice: 1,
        quantity: 1,
        rate: 1,
        categoryId: 1,
        brandId: 1,
        images: 1,
        status: 1,
        inStock: 1,
        views: 1,
        thumbs: 1,
        hierarchyPath: 1,
        availability: 1,
        hierarchy: {
          $map: {
            input: { $ifNull: ['$hierarchy', []] },
            as: 'item',
            in: {
              categoryId: '$$item.categoryId',
              categorySlug: lang
                ? { $ifNull: [`$$item.categorySlug${lang}`, null] }
                : null,
              categoryName: lang
                ? { $ifNull: [`$$item.categoryName${lang}`, null] }
                : null,
            },
          },
        },
        brand: {
          _id: '$brand._id',
          logo: '$brand.logo',
          name: lang ? { $ifNull: [`$brand.name${lang}`, null] } : null,
          website: 1,
          slug: 1,
        },
      },
    },
    {
      $sort: sort,
    },
    {
      $skip: skip,
    },
  ];

  if (limit !== 0) {
    pipeline.push({
      $limit: limit,
    });
  }

  return pipeline;
}

export async function buildOneProductPipeline(
  filter: any,
  lang: string,
): Promise<PipelineStage[]> {
  const pipeline: PipelineStage[] = [
    {
      $match: {
        ...filter,
      },
    },
    {
      $lookup: {
        from: 'brands',
        localField: 'brandId',
        foreignField: '_id',
        as: 'brand',
      },
    },
    {
      $unwind: {
        path: '$brand',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        name: lang ? { $ifNull: [`$name${lang}`, null] } : null,
        description: lang ? { $ifNull: [`$description${lang}`, null] } : null,
        slug: lang ? { $ifNull: [`$slug${lang}`, null] } : null,
        attributes: {
          $map: {
            input: { $ifNull: ['$attributes', []] },
            as: 'attribute',
            in: {
              name: lang
                ? { $ifNull: [`$$attribute.name${lang}`, null] }
                : null,
              value: lang
                ? { $ifNull: [`$$attribute.value${lang}`, null] }
                : null,
            },
          },
        },
        sku: 1,
        oldPrice: 1,
        currentPrice: 1,
        quantity: 1,
        rate: 1,
        thumbs: 1,
        categoryId: 1,
        brandId: 1,
        brand: {
          _id: '$brand._id',
          logo: '$brand.logo',
          name: lang ? { $ifNull: [`$brand.name${lang}`, null] } : null,
          website: 1,
          slug: 1,
        },
        images: 1,
        status: 1,
        inStock: 1,
        views: 1,
        hierarchyPath: 1,
        availability: 1,
        hierarchy: {
          $map: {
            input: { $ifNull: ['$hierarchy', []] },
            as: 'item',
            in: {
              categoryId: '$$item.categoryId',
              categorySlug: lang
                ? { $ifNull: [`$$item.categorySlug${lang}`, null] }
                : null,
              categoryName: lang
                ? { $ifNull: [`$$item.categoryName${lang}`, null] }
                : null,
            },
          },
        },
      },
    },
  ];
  return pipeline;
}
