import mongoose from 'mongoose';
export interface IUniversalQuery {
  page?: number;
  limit?: number;
  select?: string;
  search?: string;
  parentId?: string;
  categoryId?: string;
  brandId?: string;
  createdDate?: string;
  fromDate?: string;
  toDate?: string;
  status?: string | mongoose.Types.ObjectId;
}
