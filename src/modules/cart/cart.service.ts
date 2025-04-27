import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { AddToCartDto, DeleteCartDto, UpdateCartDto } from './dto/cart.dto';
import { IJwtPayload } from 'src/shared/interfaces/jwt-payload';
import { Cart, CartDocument } from './schemas/cart.schema';
import { Product, ProductDocument } from '../product/schemas/product.model';
import { UserDocument, User } from '../user/schemas/user.schema';

@Injectable()
export class CartService {
  constructor(
    @InjectModel(Cart.name) private readonly cartModel: Model<CartDocument>,
    @InjectModel(Product.name)
    private readonly productModel: Model<ProductDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async addToCart(body: AddToCartDto, user: IJwtPayload) {
    const userId = user._id;

    const findUser = await this.userModel.findById(userId);

    if (!findUser) {
      throw new BadRequestException('User not found. Error adding to cart');
    }

    const findProduct = await this.productModel.findById(body.productId);

    if (!findProduct) {
      throw new BadRequestException('Product not found. Error adding to cart');
    }

    const findCart = await this.cartModel.findOne({
      userId: userId,
      productId: body.productId,
    });

    if (!findCart) {
      await this.cartModel.create({
        ...body,
        userId,
      });
    }
  }

  async updateCart(body: UpdateCartDto, user: IJwtPayload) {
    const userId = user._id;
    const findUser = await this.userModel.findById(userId);
    let quantity: number;

    if (!findUser) {
      throw new BadRequestException('User not found. Error adding to cart');
    }

    const findCart = await this.cartModel.findById(body._id);

    if (!findCart) {
      throw new BadRequestException('Cart not found. Error updating cart');
    }

    quantity = findCart.quantity + body.quantity;

    await this.cartModel.findByIdAndUpdate(body._id, {
      $set: { quantity: quantity },
    });
  }

  async deleteCart(body: DeleteCartDto) {
    const findCart = await this.cartModel.findById(body._id);

    if (!findCart) {
      throw new BadRequestException('Cart not found. Error deleting cart');
    }

    await this.cartModel.findByIdAndDelete(body._id);
  }
}
