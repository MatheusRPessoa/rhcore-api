import { UserRole } from 'src/common/enums/user-role.enum';

export type AuthUser = {
  sub: string;
  username: string;
  role: UserRole;
};
