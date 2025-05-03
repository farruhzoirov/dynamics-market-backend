import {
  Body,
  Controller,
  Post,
  Headers,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { AddToCartDto, DeleteCartDto, UpdateCartDto } from './dto/cart.dto';
import { User } from 'src/common/decorators/user.decarator';
import { IJwtPayload } from 'src/shared/interfaces/jwt-payload';
import { CartService } from './cart.service';
import {
  AddedSuccessResponse,
  DeletedSuccessResponse,
  UpdatedSuccessResponse,
} from 'src/shared/success/success-responses';
import { AcceptLanguagePipe } from 'src/common/pipes/language.pipe';
import { ApiBearerAuth } from '@nestjs/swagger';

@Controller('cart')
@ApiBearerAuth()
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @HttpCode(HttpStatus.OK)
  @Post('list')
  async getCartList(
    @Headers('accept-language') lang: string,
    @User() user: IJwtPayload,
  ) {
    lang = new AcceptLanguagePipe().transform(lang);
    const cartList = await this.cartService.getCartList(user, lang);
    return cartList;
  }

  @Post('add')
  async addToCart(@Body() body: AddToCartDto, @User() user: IJwtPayload) {
    await this.cartService.addToCart(body, user);
    return new AddedSuccessResponse();
  }

  @HttpCode(HttpStatus.OK)
  @Post('update')
  async updateCart(@Body() body: UpdateCartDto, @User() user: IJwtPayload) {
    await this.cartService.updateCart(body, user);
    return new UpdatedSuccessResponse();
  }

  @HttpCode(HttpStatus.OK)
  @Post('delete')
  async deleteCart(@Body() body: DeleteCartDto) {
    await this.cartService.deleteCart(body);
    return new DeletedSuccessResponse();
  }
}
