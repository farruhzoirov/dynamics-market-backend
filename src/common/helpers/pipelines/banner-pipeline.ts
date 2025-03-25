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
        // images: { $ifNull: ['$images', []] },
        images: {
          $map: {
            input: { $ifNull: ['$images', []] },
            as: 'image',
            in: {
              url: { $ifNull: [`$$image.path`, null] },
            },
          },
        },

        brandIds: { $ifNull: ['$brandIds', []] },
        hierarchy: {
          $map: {
            input: { $ifNull: ['$hierarchy', []] },
            as: 'item',
            in: lang
              ? {
                  categoryId: '$$item.categoryId',
                  categoryName: {
                    $ifNull: [`$$item.categoryName${lang}`, null],
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
            in: lang
              ? {
                  slug: { $ifNull: [`$$brand.slug${lang}`, null] },
                }
              : '$$brand',
          },
        },
      },
    },
  ];
}
