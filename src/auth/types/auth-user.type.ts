import { UserPermission } from 'src/common/enums/user-permission.enum';
import { UserRole } from 'src/common/enums/user-role.enum';

export type AuthUser = {
  sub: string;
  username: string;
  role: UserRole;
  permissions: UserPermission[];
  funcionario_id: string | null;
};
