import { UserRole } from '../enums/user-role.enum';

export interface AuthenticatedRequest extends Request {
  user: {
    sub: string;
    username: string;
    role: UserRole;
    refreshToken?: string;
  };
}
