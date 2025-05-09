import { User } from '../prisma/prisma-client/client.ts';

export type SessionUser = Pick<User, 'access' | 'id' | 'username'>;

export function toSessionUser({ access, id, username }: User): SessionUser {
  return { access, id, username };
}
