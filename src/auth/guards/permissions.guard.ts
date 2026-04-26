import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserPermission } from 'src/common/enums/user-permission.enum';
import { UserRole } from 'src/common/enums/user-role.enum';
import { PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<UserPermission[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!required || required.length === 0) return true;

    const { user } = context.switchToHttp().getRequest();

    if (user.role === UserRole.ADMIN) return true;

    const hasAll = required.every((p) => user.permissions.includes(p));

    if (!hasAll) {
      throw new ForbiddenException(
        'Você não tem permissão para realizar esta ação',
      );
    }

    return true;
  }
}
