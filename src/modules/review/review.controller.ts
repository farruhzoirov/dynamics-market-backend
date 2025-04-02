import { Body, Controller, Post, Req } from '@nestjs/common';
import { ReviewService } from './review.service';
import {
  AddedSuccessResponse,
  UpdatedSuccessResponse,
} from 'src/shared/success/success-responses';
import {
  AddReviewDto,
  DeleteReviewDto,
  UpdateReviewDto,
} from './dto/review.dto';
import { Request } from 'express';
import { IJwtPayload } from 'src/shared/interfaces/jwt-payload';

@Controller('review')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post('add')
  async addReview(@Body() body: AddReviewDto, @Req() req: Request) {
    const user = req.user as IJwtPayload;
    await this.reviewService.addReview(body, user._id);
    return new AddedSuccessResponse();
  }

  @Post('update')
  async updateReview(@Body() body: UpdateReviewDto, @Req() req: Request) {
    const user = req.user as IJwtPayload;
    await this.reviewService.updateReview(body, user._id);
    return new UpdatedSuccessResponse();
  }

  @Post('delete')
  async deleteReview(@Body() body: DeleteReviewDto, @Req() req: Request) {
    const user = req.user as IJwtPayload;
    await this.reviewService.deleteReview(body, user._id);
  }
}
