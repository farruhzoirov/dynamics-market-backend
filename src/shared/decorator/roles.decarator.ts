import {SetMetadata} from '@nestjs/common';
import {UserRole} from "../../modules/user/enums/roles.enum";

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);