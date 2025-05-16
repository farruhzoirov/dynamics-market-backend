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

export const buildSingleOrderPipeline = async (
  match: Record<string, string | boolean>,
  lang: string,
) => {
  return [
    {
      $match: match,
    },
    {
      $lookup: {
        from: "products", // Replace with your actual products collection name
        localField: "items.productId",
        foreignField: "_id",
        as: "productDetails"
      }
    },
    {
      $project: {
        _id: 1,
        orderCode: 1,
        firstName: 1,
        lastName: 1,
        email: 1,
        price: 1,
        phone: 1,
        customerType: 1,
        companyName: 1,
        createdAt: 1,
        status: 1,
        items: {
          $map: {
            input: { $ifNull: ['$items', []] },
            as: 'item',
            in: {
              productId: '$$item.productId',
              name: lang ? { $ifNull: [`$$item.name.${lang}`, null] } : null,
              quantity: '$$item.quantity',
              price: '$$item.price',
              thumbs: {
                $let: {
                  vars: {
                    productMatch: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$productDetails",
                            as: "product",
                            cond: { $eq: ["$$product._id", "$$item.productId"] }
                          }
                        },
                        0
                      ]
                    }
                  },
                  in: "$$productMatch.thumbs"
                }
              }
            },
          },
        },
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
