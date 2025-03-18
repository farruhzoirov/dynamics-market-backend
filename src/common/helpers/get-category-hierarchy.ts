import mongoose, {Model} from 'mongoose';
import {CategoryDocument} from 'src/modules/category/schemas/category.schema';

export async function getCategoryHierarchy(
    categoryModel: Model<CategoryDocument>,
    categoryId: string,
) {
  const categoryWithParents = await categoryModel.aggregate([
    {$match: {_id: new mongoose.Types.ObjectId(categoryId)}},
    {
      $graphLookup: {
        from: 'categories',
        startWith: '$parentId',
        connectFromField: 'parentId',
        connectToField: '_id',
        as: 'hierarchy',
        depthField: 'depth',
        maxDepth: 3,
      },
    },
    {
      $addFields: {
        allParents: {$concatArrays: [['$$ROOT'], '$hierarchy']},
      },
    },
    {
      $unwind: '$allParents',
    },
    {
      $sort: {
        'allParents.depth': 1,
      },
    },
    {
      $group: {
        _id: '$_id',
        allParents: {$push: '$allParents'},
      },
    },
  ]);

  const hierarchy = categoryWithParents[0].allParents.map((cat: any) => ({
    categoryId: cat._id.toString(),
    categorySlugUz: cat.slugUz,
    categorySlugRu: cat.slugRu,
    categorySlugEn: cat.slugEn,
    categoryNameUz: cat.nameUz,
    categoryNameRu: cat.nameRu,
    categoryNameEn: cat.nameEn,
  }));

  const hierarchyPath = categoryWithParents[0].allParents.map((cat: any) => {
    return cat._id.toString();
  });

  return {
    hierarchy,
    hierarchyPath,
  };
}
