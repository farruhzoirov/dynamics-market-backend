export async function buildCategoryHierarchyPipeline(lang: string) {
  return [
    {
      $match: { parentId: null, isDeleted: false },
    },
    {
      $graphLookup: {
        from: 'categories',
        startWith: '$_id',
        connectFromField: '_id',
        connectToField: 'parentId',
        as: 'allDescendants',
        maxDepth: 2,
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
      $set: {
        directChildren: {
          $sortArray: {
            input: '$directChildren',
            sortBy: { nameUz: 1 },
          },
        },
        allDescendants: {
          $sortArray: {
            input: '$allDescendants',
            sortBy: { nameUz: 1 },
          },
        },
      },
    },
    {
      $project: {
        _id: 1,
        name: { $ifNull: [`$name${lang}`, '$nameUz'] },
        slug: { $ifNull: [`$slug${lang}`, '$slugUz'] },
        slugUz: 1,
        slugRu: 1,
        slugEn: 1,
        image: 1,
        parentId: 1,
        children: {
          $map: {
            input: '$directChildren',
            as: 'child',
            in: {
              _id: '$$child._id',
              name: { $ifNull: [`$$child.name${lang}`, '$$child.nameUz'] },
              slug: { $ifNull: [`$$child.slug${lang}`, '$$child.slugUz'] },
              slugUz: `$$child.slugUz`,
              slugRu: `$$child.slugRu`,
              slugEn: `$$child.slugEn`,
              image: 1,
              parentId: '$$child.parentId',
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
                    slugUz: `$$grandchild.slugUz`,
                    slugRu: `$$grandchild.slugRu`,
                    slugEn: `$$grandchild.slugEn`,
                    image: 1,
                    parentId: '$$grandchild.parentId',
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
                          slugUz: `$$greatGrandchild.slugUz`,
                          slugRu: `$$greatGrandchild.slugRu`,
                          slugEn: `$$greatGrandchild.slugEn`,
                          image: 1,
                          parentId: '$$greatGrandchild.parentId',
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
