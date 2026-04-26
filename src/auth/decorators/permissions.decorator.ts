import { SetMetadata } from '@nestjs/common';
import { UserPermission } from 'src/common/enums/user-permission.enum';

export const PERMISSIONS_KEY = 'permissions';

export const RequirePermissions = (...permissions: UserPermission[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
