import { Model } from 'mongoose';
import { ProductDocument } from 'src/modules/product/schemas/product.model';

export const generateUniqueSKU = async (
  productModel: Model<ProductDocument>,
): Promise<string> => {
  const productCount = await productModel.countDocuments();
  const skuNumber = productCount + 1;
  return skuNumber.toString().padStart(5, '0');
};
