export async function buildCategoryHierarchyPipeline(lang: string) {
  return [
    {
      $match: { parentId: null },
    },
    {
      $graphLookup: {
        from: 'categories',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parentId',
        as: 'allDescendants',
        maxDepth: 3,
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: 'parentId',
        as: 'directChildren',
      },
    },
    {
      $project: {
        _id: 1,
        name: { $ifNull: [`$name${lang}`, '$nameUz'] },
        slug: { $ifNull: [`$slug${lang}`, '$slugUz'] },
        children: {
          $map: {
            input: '$directChildren',
            as: 'child',
            in: {
              _id: '$$child._id',
              name: { $ifNull: [`$$child.name${lang}`, '$$child.nameUz'] },
              slug: { $ifNull: [`$$child.slug${lang}`, '$$child.slugUz'] },
              children: {
                $map: {
                  input: {
                    $filter: {
                      input: '$allDescendants',
                      as: 'grandchild',
                      cond: { $eq: ['$$grandchild.parentId', '$$child._id'] },
                    },
                  },
                  as: 'grandchild',
                  in: {
                    _id: '$$grandchild._id',
                    name: {
                      $ifNull: [
                        `$$grandchild.name${lang}`,
                        '$$grandchild.nameUz',
                      ],
                    },
                    slug: {
                      $ifNull: [
                        `$$grandchild.slug${lang}`,
                        '$$grandchild.slugUz',
                      ],
                    },
                    children: {
                      $map: {
                        input: {
                          $filter: {
                            input: '$allDescendants',
                            as: 'greatGrandchild',
                            cond: {
                              $eq: [
                                '$$greatGrandchild.parentId',
                                '$$grandchild._id',
                              ],
                            },
                          },
                        },
                        as: 'greatGrandchild',
                        in: {
                          _id: '$$greatGrandchild._id',
                          name: {
                            $ifNull: [
                              `$$greatGrandchild.name${lang}`,
                              '$$greatGrandchild.nameUz',
                            ],
                          },
                          slug: {
                            $ifNull: [
                              `$$greatGrandchild.slug${lang}`,
                              '$$greatGrandchild.slugUz',
                            ],
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
  ];
}
