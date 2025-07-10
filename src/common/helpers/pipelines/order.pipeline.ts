export const buildUserOrdersPipeline = async (
  userId: string,
  lang: string,
  sort: Record<string, any>,
  skip: number,
  limit: number,
  status: string | null = null,
) => {
  return [
    {
      $match: {
        userId: userId,
        isDeleted: false,
        status: status ? status : {},
      },
    },
    {
      $lookup: {
        from: 'orderstatuses',
        localField: 'status',
        foreignField: '_id',
        as: 'statusInfo',
      },
    },
    {
      $unwind: {
        path: '$statusInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $project: {
        _id: 1,
        orderCode: 1,
        comment: 1,
        createdAt: 1,
        items: {
          $map: {
            input: { $ifNull: ['$items', []] },
            as: 'item',
            in: {
              productId: '$$item.productId',
              name: lang ? { $ifNull: [`$$item.name${lang}`, null] } : null,
              quantity: '$$item.quantity',
              price: '$$item.price',
            },
          },
        },
        status: {
          _id: '$statusInfo._id',
          name: lang ? { $ifNull: [`$statusInfo.name${lang}`, null] } : null,
          color: '$statusInfo.color',
          index: '$statusInfo.index',
          createdAt: '$statusInfo.createdAt',
          updatedAt: '$statusInfo.updatedAt',
        },

        itemsCount: {
          $size: { $ifNull: ['$items', []] },
        },
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
  ];
};

export const buildSingleOrderPipeline = async (
  match: Record<string, string | boolean>,
  lang: string,
) => {
  return [
    {
      $match: match,
    },
    {
      $unwind: {
        path: '$items',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $lookup: {
        from: 'products',
        let: { pid: '$items.productId' },
        pipeline: [
          {
            $match: {
              $expr: { $eq: ['$_id', { $toObjectId: '$$pid' }] },
            },
          },
          {
            $project: {
              thumbs: 1,
              [`slug${lang}`]: 1,
            },
          },
        ],
        as: 'productDetails',
      },
    },

    {
      $unwind: {
        path: '$productDetails',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $addFields: {
        'items.thumbs': '$productDetails.thumbs',
        'items.productId': '$items.productId',
        'items.slug': `$productDetails.slug${lang}`,
        'items.name': lang ? { $ifNull: [`$items.name${lang}`, null] } : null,
        quantity: '$items.quantity',
        price: '$items.price',
      },
    },
    {
      $lookup: {
        from: 'orderstatuses',
        localField: 'status',
        foreignField: '_id',
        as: 'statusInfo',
      },
    },
    {
      $unwind: {
        path: '$statusInfo',
        preserveNullAndEmptyArrays: true,
      },
    },
    {
      $group: {
        _id: '$_id',
        orderCode: { $first: '$orderCode' },
        firstName: { $first: '$firstName' },
        lastName: { $first: '$lastName' },
        email: { $first: '$email' },
        price: { $first: '$price' },
        phone: { $first: '$phone' },
        customerType: { $first: '$customerType' },
        companyName: { $first: '$companyName' },
        createdAt: { $first: '$createdAt' },
        items: { $push: '$items' },
        status: {
          $first: {
            _id: `$statusInfo._id`,
            name: lang ? { $ifNull: [`$statusInfo.name${lang}`, null] } : null,
            color: `$statusInfo.color`,
            index: `$statusInfo.index`,
            createdAt: `$statusInfo.createdAt`,
            updatedAt: `$statusInfo.updatedAt`,
          },
        },
      },
    },
  ];
};

export const buildCartItemsPipeline = async (userId: string) => {
  return [
    {
      $match: {
        userId: userId,
      },
    },
    {
      $addFields: {
        productId: { $toObjectId: '$productId' },
      },
    },
    {
      $lookup: {
        from: 'products',
        localField: 'productId',
        foreignField: '_id',
        as: 'product',
      },
    },
    { $unwind: { path: '$product' } },

    {
      $project: {
        quantity: 1,
        product: {
          _id: 1,
          nameUz: 1,
          nameRu: 1,
          nameEn: 1,
          sku: 1,
          currentPrice: '$product.currentPrice',
        },
      },
    },
  ];
};
