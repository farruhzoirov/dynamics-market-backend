import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';
import { Model } from 'mongoose';
import {
  AddReviewDto,
  DeleteReviewDto,
  UpdateReviewDto,
} from './dto/review.dto';
import { AddingModelException } from 'src/common/errors/model/model-based.exceptions';

@Injectable()
export class ReviewService {
  constructor(
    @InjectModel(Review.name)
    private readonly reviewModel: Model<ReviewDocument>,
  ) {}
  async addReview(body: AddReviewDto, userId: string) {
    try {
      await this.reviewModel.create({
        ...body,
        userId,
      });
    } catch (err) {
      console.log('Error adding review', err.message);
      throw new AddingModelException();
    }
  }

  async updateReview(updateBody: UpdateReviewDto, userId: string) {
    const findReviewOfUser = await this.reviewModel.findOne({
      _id: updateBody._id,
      userId,
    });

    if (!findReviewOfUser) {
      throw new BadRequestException(
        'User is not authorized to update this review.',
      );
    }
    const updateFields: Partial<{ text: string; rating: number }> = {};

    if (updateBody.text) {
      updateFields.text = updateBody.text;
    }
    if (updateBody.rating) {
      updateFields.rating = updateBody.rating;
    }

    await this.reviewModel.findByIdAndUpdate(
      {
        _id: updateBody._id,
      },
      {
        $set: updateFields,
      },
    );
  }

  async deleteReview(body: DeleteReviewDto, userId: string) {
    const findReviewOfUser = await this.reviewModel.findOne({
      _id: body._id,
      userId,
    });
    if (!findReviewOfUser) {
      throw new BadRequestException(
        'User is not authorized to delete this review.',
      );
    }

    //...
  }
}
