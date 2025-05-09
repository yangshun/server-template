import { Role } from '../prisma/prisma-client/client.ts';

export default function isAdmin({ access }: { access: Role }): boolean {
  return access === 'Admin';
}
