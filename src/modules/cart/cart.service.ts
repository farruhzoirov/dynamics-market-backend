import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
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

  async getCartList(user: IJwtPayload, lang: string) {
    const findCartList = await this.cartModel.aggregate([
      {
        $match: { userId: user._id },
      },
      {
        $lookup: {
          from: 'products',
          localField: 'productId',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $unwind: '$product',
      },
      {
        $project: {
          _id: 1,
          quantity: 1,
          product: {
            name: lang ? { $ifNull: [`$name${lang}`, null] } : null,
            description: lang
              ? { $ifNull: [`$description${lang}`, null] }
              : null,
            slug: lang ? { $ifNull: [`$slug${lang}`, null] } : null,
            attributes: {
              $map: {
                input: { $ifNull: ['$attributes', []] },
                as: 'attribute',
                in: {
                  name: lang
                    ? { $ifNull: [`$$attribute.name${lang}`, null] }
                    : null,
                  value: lang
                    ? { $ifNull: [`$$attribute.value${lang}`, null] }
                    : null,
                },
              },
            },
            sku: 1,
            oldPrice: 1,
            currentPrice: 1,
            quantity: 1,
            rate: 1,
            categoryId: 1,
            brandId: 1,
            images: 1,
            status: 1,
            inStock: 1,
            views: 1,
            hierarchyPath: 1,
            availability: 1,
            hierarchy: {
              $map: {
                input: { $ifNull: ['$hierarchy', []] },
                as: 'item',
                in: {
                  categoryId: '$$item.categoryId',
                  categorySlug: lang
                    ? { $ifNull: [`$$item.categorySlug${lang}`, null] }
                    : null,
                  categoryName: lang
                    ? { $ifNull: [`$$item.categoryName${lang}`, null] }
                    : null,
                },
              },
            },
            brand: {
              _id: '$brand._id',
              logo: '$brand.logo',
              name: lang ? { $ifNull: [`$brand.name${lang}`, null] } : null,
              website: 1,
              slug: 1,
            },
          },
        },
      },
    ]);

    return findCartList;
  }

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
        productId: body.productId,
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
