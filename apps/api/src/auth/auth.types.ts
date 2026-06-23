import type { Request } from 'express';

export interface CurrentUserData {
  id: string;
  name: string;
  roles: string[];
}

export interface AuthenticatedRequest extends Request {
  user?: CurrentUserData;
}