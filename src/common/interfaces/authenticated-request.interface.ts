import { UserPermission } from '../enums/user-permission.enum';
import { UserRole } from '../enums/user-role.enum';

export interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    username: string;
    role: UserRole;
    permissions: UserPermission[];
    funcionario_id: string | null;
    refreshToken?: string;
  };
}
