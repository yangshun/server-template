import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './prisma-client/client.ts';

const adapter = new PrismaPg(
  { connectionString: process.env.DATABASE_URL },
  { schema: 'pokemon' }, // Only needed if not using "public" schema
);

declare global {
  namespace PrismaJson {
    type PokemonStats = Readonly<{
      attack: number;
      defense: number;
      hp: number;
      level: number;
      specialAttack: number;
      specialDefense: number;
      speed: number;
    }>;
  }
}

export default new PrismaClient({ adapter });
