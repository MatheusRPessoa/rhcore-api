import { UserRole } from 'src/common/enums/user-role.enum';

export type JwtPayload = {
  sub: number;
  username: string;
  role: UserRole;
};
