import {ILocations} from "./location";

export interface JwtPayload {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  locations: ILocations[] | [];
  gender: string | null;
  telegram: string | null;
  regionId: string | null;
  districtId: string | null;
  address: string | null;
  phone: string | null;
}