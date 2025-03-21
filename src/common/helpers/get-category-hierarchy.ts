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
        name: {
          $getField: { field: { $concat: ['name', lang] }, input: '$$ROOT' },
        },
        slug: {
          $getField: { field: { $concat: ['slug', lang] }, input: '$$ROOT' },
        },
        children: {
          $map: {
            input: '$directChildren',
            as: 'child',
            in: {
              _id: '$$child._id',
              name: {
                $getField: {
                  field: { $concat: ['name', lang] },
                  input: '$$child',
                },
              },
              slug: {
                $getField: {
                  field: { $concat: ['slug', lang] },
                  input: '$$child',
                },
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
                      $getField: {
                        field: { $concat: ['name', lang] },
                        input: '$$grandchild',
                      },
                    },
                    slug: {
                      $getField: {
                        field: { $concat: ['slug', lang] },
                        input: '$$grandchild',
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
