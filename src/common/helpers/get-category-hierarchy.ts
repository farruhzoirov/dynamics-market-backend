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
      $addFields: {
        nameField: { $arrayElemAt: [{ $objectToArray: '$name' }, 1] },
        slugField: { $arrayElemAt: [{ $objectToArray: '$slug' }, 1] },
      },
    },
    {
      $project: {
        _id: 1,
        name: `$name.${lang}`,
        slug: `$slug.${lang}`,
        children: {
          $map: {
            input: '$directChildren',
            as: 'child',
            in: {
              _id: '$$child._id',
              name: `$${lang}`,
              slug: `$${lang}`,
              children: {
                $filter: {
                  input: '$allDescendants',
                  as: 'grandchild',
                  cond: { $eq: ['$$grandchild.parentId', '$$child._id'] },
                },
              },
            },
          },
        },
      },
    },
  ];
}
