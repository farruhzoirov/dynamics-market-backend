export async function buildProductPipeline(lang: string) {
  return [
    {
      $match: {
        isDeleted: false,
        status: 1,
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
        hierarchyPath: 1,
      },
    },
  ];
}
