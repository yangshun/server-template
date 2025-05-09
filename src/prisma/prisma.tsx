import { PrismaClient } from './prisma-client/client.ts';

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

export default new PrismaClient();
