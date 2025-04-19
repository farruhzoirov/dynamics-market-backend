import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddToCartDto } from './dto/cart.dto';
import { IJwtPayload } from 'src/shared/interfaces/jwt-payload';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Product, ProductDocument } from '../product/schemas/product.model';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
  ) {}

  async addToCart(body: AddToCartDto, user: IJwtPayload) {
    const userId = user._id;

    const findProduct = await this.productModel.findById(body.productId);

    if (!findProduct) {
      throw new BadRequestException('Product not found. Error adding to cart');
    }

    if (body.quantity > findProduct.quantity) {
      throw new BadRequestException('Quantity is too large');
    }

    const findCart = await this.cartModel.findOne({
      userId: userId,
      productId: body.productId,
    });

    if (findCart) {
      throw new BadRequestException('Product already added to the cart');
    }

    await this.cartModel.create({
      ...body,
      userId,
    });
  }
}
