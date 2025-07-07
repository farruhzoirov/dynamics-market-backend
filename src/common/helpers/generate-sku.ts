import { Model } from 'mongoose';
import { ProductDocument } from 'src/modules/product/schemas/product.model';

export const generateUniqueSKU = async (
  productModel: Model<ProductDocument>,
): Promise<string> => {
  // const productCount = await productModel.countDocuments();
  const lastProduct = await productModel
    .findOne()
    .sort({ sku: -1 })
    .select('sku')
    .lean();

  const skuNumber = parseInt(lastProduct.sku) + 1;
  return skuNumber.toString().padStart(5, '0');
};
