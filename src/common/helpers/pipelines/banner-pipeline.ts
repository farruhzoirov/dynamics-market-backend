export async function buildBannerPipeline(lang: string) {
  return [
    {
      $match: {
        isDeleted: false,
      },
    },
    {
      $project: {
        title: lang ? { $ifNull: [`$title${lang}`, null] } : null,
        text: lang ? { $ifNull: [`$text${lang}`, null] } : null,
        status: { $ifNull: ['$status', 1] },
        type: { $ifNull: ['$type', null] },
        images: { $ifNull: ['$images', []] },

        brandIds: { $ifNull: ['$brandIds', []] },
        hierarchy: {
          $map: {
            input: { $ifNull: ['$hierarchy', []] },
            as: 'item',
            in: lang
              ? {
                  categoryId: '$$item.categoryId',
                  categorySlug: {
                    $ifNull: [`$$item.categorySlug${lang}`, null],
                  },
                }
              : '$$item',
          },
        },
        product: {
          $cond: {
            if: { $not: ['$product'] },
            then: null,
            else: lang
              ? {
                  slug: { $ifNull: [`$product.slug${lang}`, null] },
                  productId: '$product.productId',
                }
              : '$product',
          },
        },
        brandSlugs: {
          $map: {
            input: { $ifNull: ['$brandSlugs', []] },
            as: 'brand',
            in: { $ifNull: [`$$brand.slug`, null] },
          },
        },
      },
    },
  ];
}
