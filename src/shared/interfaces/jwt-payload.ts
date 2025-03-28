import { ILocations } from './location';

export interface IJwtPayload {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string;
  role: string;
  locations?: ILocations[] | [];
  gender?: string | null;
  telegram?: string | null;
  regionId?: string | null;
  districtId?: string | null;
  address?: string | null;
  phone?: string | null;
}
