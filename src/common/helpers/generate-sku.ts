import { Model } from 'mongoose';
import { ProductDocument } from 'src/modules/product/schemas/product.model';

export const generateUniqueSKU = async (
  productModel: Model<ProductDocument>,
): Promise<string> => {
  const productCount = await productModel.countDocuments();
  return `${productCount + 1}`;
};
