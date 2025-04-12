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
        slugUz: 1,
        slugRu: 1,
        slugEn: 1,
        parentId: 1,
        children: {
          $map: {
            input: '$directChildren',
            as: 'child',
            in: {
              _id: '$$child._id',
              name: { $ifNull: [`$$child.name${lang}`, '$$child.nameUz'] },
              slugUz: `$$child.slugUz`,
              slugRu: `$$child.slugRu`,
              slugEn: `$$child.slugEn`,
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
                    slugUz: `$$grandchild.slugUz`,
                    slugRu: `$$grandchild.slugRu`,
                    slugEn: `$$grandchild.slugEn`,
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
                          slugUz: `$$greatGrandchild.slugUz`,
                          slugRu: `$$greatGrandchild.slugRu`,
                          slugEn: `$$greatGrandchild.slugEn`,
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
