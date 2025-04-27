import { Body, Controller, Post } from '@nestjs/common';
import { AddToCartDto, DeleteCartDto, UpdateCartDto } from './dto/cart.dto';
import { User } from 'src/common/decorators/user.decarator';
import { IJwtPayload } from 'src/shared/interfaces/jwt-payload';
import { CartService } from './cart.service';

@Controller('card')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Post('list')
  async getCartList() {}

  @Post('add')
  async addToCart(@Body() body: AddToCartDto, @User() user: IJwtPayload) {
    await this.cartService.addToCart(body, user);
  }

  @Post('update')
  async updateCart(@Body() body: UpdateCartDto, @User() user: IJwtPayload) {
    await this.cartService.updateCart(body, user);
  }

  @Post('delete')
  async deleteCart(@Body() body: DeleteCartDto) {
    await this.cartService.deleteCart(body);
  }
}
