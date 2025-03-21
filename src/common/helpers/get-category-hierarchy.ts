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
      // Yangi maydon qo'shish
      $addFields: {
        nameField: { $concat: ['name', lang] },
        slugField: { $concat: ['slug', lang] },
      },
    },
    {
      $project: {
        _id: 1,
        name: { $getField: { field: '$nameField', input: '$$ROOT' } },
        slug: { $getField: { field: '$slugField', input: '$$ROOT' } },
        children: {
          $map: {
            input: '$directChildren',
            as: 'child',
            in: {
              _id: '$$child._id',
              name: {
                $getField: { field: '$nameField', input: '$$child' },
              },
              slug: {
                $getField: { field: '$slugField', input: '$$child' },
              },
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
    {
      $project: {
        _id: 1,
        name: 1,
        slug: 1,
        children: {
          $map: {
            input: '$children',
            as: 'child',
            in: {
              _id: '$$child._id',
              name: '$$child.name',
              slug: '$$child.slug',
              children: {
                $map: {
                  input: '$$child.children',
                  as: 'grandchild',
                  in: {
                    _id: '$$grandchild._id',
                    name: {
                      $getField: { field: '$nameField', input: '$$grandchild' },
                    },
                    slug: {
                      $getField: { field: '$slugField', input: '$$grandchild' },
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
