import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import {
  AddToCartDto,
  DeleteCartDto,
  GetCartListDto,
  UpdateCartDto,
} from './dto/cart.dto';
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

  async getCartList(body: GetCartListDto, user: IJwtPayload, lang: string) {
    const findCartList = await this.cartModel.aggregate([
      {
        $match: { userId: user._id },
      },
      {
        $addFields: {
          productId: { $toObjectId: '$productId' },
        },
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
        $unwind: {
          path: '$product',
        },
      },
      {
        $project: {
          _id: 1,
          quantity: 1,
          userId: 1,
          product: {
            name: { $ifNull: [`$product.name${lang}`, null] },
            description: { $ifNull: [`$product.description${lang}`, null] },
            slug: { $ifNull: [`$product.slug${lang}`, null] },
            attributes: {
              $map: {
                input: { $ifNull: ['$product.attributes', []] },
                as: 'attribute',
                in: {
                  name: { $ifNull: [`$$attribute.name${lang}`, null] },
                  value: { $ifNull: [`$$attribute.value${lang}`, null] },
                },
              },
            },
            sku: '$product.sku',
            oldPrice: '$product.oldPrice',
            currentPrice: '$product.currentPrice',
            quantity: '$product.quantity',
            rate: '$product.rate',
            categoryId: '$product.categoryId',
            brandId: '$product.brandId',
            images: '$product.images',
            status: '$product.status',
            inStock: '$product.inStock',
            views: '$product.views',
            hierarchyPath: '$product.hierarchyPath',
            availability: '$product.availability',
            thumbs: '$product.thumbs',
            hierarchy: {
              $map: {
                input: { $ifNull: ['$product.hierarchy', []] },
                as: 'item',
                in: {
                  categoryId: '$$item.categoryId',
                  categorySlug: {
                    $ifNull: [`$$item.categorySlug${lang}`, null],
                  },
                  categoryName: {
                    $ifNull: [`$$item.categoryName${lang}`, null],
                  },
                },
              },
            },
            brand: {
              _id: '$product.brand._id',
              logo: '$product.brand.logo',
              name: { $ifNull: [`$product.brand.name${lang}`, null] },
              website: '$product.brand.website',
              slug: '$product.brand.slug',
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

    if (
      findCart &&
      body.quantity &&
      typeof body.quantity === 'number' &&
      body.quantity > 0
    ) {
      const quantity = findCart.quantity + body.quantity;
      await this.cartModel.findByIdAndUpdate(findCart._id, {
        $set: { quantity: quantity },
      });
    }

    if (!findCart) {
      await this.cartModel.create({
        productId: body.productId,
        userId,
        quantity: body.quantity ? body.quantity : 1,
      });
    }
  }

  async updateCart(body: UpdateCartDto, user: IJwtPayload) {
    const userId = user._id;
    const findUser = await this.userModel.findById(userId);

    if (!findUser) {
      throw new BadRequestException('User not found. Error adding to cart');
    }

    const findCart = await this.cartModel.findById(body._id);

    if (!findCart) {
      throw new BadRequestException('Cart not found. Error updating cart');
    }

    await this.cartModel.findByIdAndUpdate(body._id, {
      $set: { quantity: body.quantity },
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
