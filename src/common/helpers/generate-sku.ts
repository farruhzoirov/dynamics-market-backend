import {Model} from 'mongoose';
import {ProductDocument} from 'src/modules/product/schemas/product.model';
import {v4 as uuidv4} from 'uuid';

export const generateUniqueSKU = async (
    productModel: Model<ProductDocument>,
): Promise<string> => {
  const skuNumber = uuidv4().replace(/\D/g, '').slice(0, 5);
  const productCount = await productModel.countDocuments();
  return `${skuNumber}/${productCount + 1}`;
};
