export const buildUserOrdersPipeline = async (
  userId: string,
  lang: string,
  skip: number,
  limit: number,
) => {
  return [
    {
      $match: {
        userId: userId,
        isDeleted: false,
      },
    },
    {
      $project: {
        _id: 1,
        orderCode: 1,
        status: 1,
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
        itemsCount: {
          $size: { $ifNull: ['$items', []] },
        },
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ];
};

// export const buildSingleOrderPipeline = async (
//   match: Record<string, string | boolean>,
//   lang: string,
// ) => {
//   return [
//     {
//       $match: match,
//     },
//     {
//       $project: {
//         _id: 1,
//         orderCode: 1,
//         firstName: 1,
//         lastName: 1,
//         email: 1,
//         price: 1,
//         phone: 1,
//         customerType: 1,
//         companyName: 1,
//         createdAt: 1,
//         status: 1,
//         items: {
//           $map: {
//             input: { $ifNull: ['$items', []] },
//             as: 'item',
//             in: {
//               productId: '$$item.productId',
//               name: lang ? { $ifNull: [`$$item.name${lang}`, null] } : null,
//               quantity: '$$item.quantity',
//               price: '$$item.price',
//             },
//           },
//         },
//       },
//     },
//   ];
// };




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
              [`slug${lang}`]: 1
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
        'items.productId': 'items.productId',
        'items.slug': `$productDetails.slug${lang}`,
        'items.name': lang
          ? { $ifNull: [`$items.name${lang}`, null] }
          : null,
        'quantity': '$items.quantity',
        price: '$items.price',
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
        status: { $first: '$status' },
        items: { $push: '$items' },
      },
    },
  ];
};




export const buildCartItemsPipeline = (userId: string) => {
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
          currentPrice: '$product.currentPrice',
        },
      },
    },
  ];
};
