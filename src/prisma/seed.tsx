#!/usr/bin/env NODE_ENV=development node_modules/.bin/nodemon -q -I --exec node --no-warnings --experimental-specifier-resolution=node --loader ts-node/esm --env-file .env
import { styleText } from 'node:util';
import random from '@nkzw/core/random.js';
import arrayShuffle from 'array-shuffle';
import generateSalt from '../user/generateSalt.tsx';
import { hashPassword } from '../user/hashPassword.tsx';
import { PrismaClient } from './prisma-client/client.ts';

const prisma = new PrismaClient();

const users = new Set([
  {
    access: 'Admin',
    displayName: 'Admin',
    email: 'admin@nakazawa.dev',
    password: 'not-a-secure-password',
    salt: generateSalt(),
    username: 'admin',
  },
  {
    displayName: 'First User',
    email: 'first-user@nakazawa.dev',
    password: 'not-a-secure-password-either',
    salt: generateSalt(),
    username: 'first-user',
  },
] as const);

const pokemon = new Set([
  { id: 1, name: 'Bulbasaur', primaryType: 'Grass', secondaryType: 'Poison' },
  { id: 2, name: 'Ivysaur', primaryType: 'Grass', secondaryType: 'Poison' },
  { id: 3, name: 'Venusaur', primaryType: 'Grass', secondaryType: 'Poison' },
  { id: 4, name: 'Charmander', primaryType: 'Fire', secondaryType: null },
  { id: 5, name: 'Charmeleon', primaryType: 'Fire', secondaryType: null },
  { id: 6, name: 'Charizard', primaryType: 'Fire', secondaryType: 'Flying' },
  { id: 7, name: 'Squirtle', primaryType: 'Water', secondaryType: null },
  { id: 8, name: 'Wartortle', primaryType: 'Water', secondaryType: null },
  { id: 9, name: 'Blastoise', primaryType: 'Water', secondaryType: null },
  { id: 10, name: 'Caterpie', primaryType: 'Bug', secondaryType: null },
  { id: 11, name: 'Metapod', primaryType: 'Bug', secondaryType: null },
  { id: 12, name: 'Butterfree', primaryType: 'Bug', secondaryType: 'Flying' },
  { id: 13, name: 'Weedle', primaryType: 'Bug', secondaryType: 'Poison' },
  { id: 14, name: 'Kakuna', primaryType: 'Bug', secondaryType: 'Poison' },
  { id: 15, name: 'Beedrill', primaryType: 'Bug', secondaryType: 'Poison' },
  { id: 16, name: 'Pidgey', primaryType: 'Normal', secondaryType: 'Flying' },
  { id: 17, name: 'Pidgeotto', primaryType: 'Normal', secondaryType: 'Flying' },
  { id: 18, name: 'Pidgeot', primaryType: 'Normal', secondaryType: 'Flying' },
  { id: 19, name: 'Rattata', primaryType: 'Normal', secondaryType: null },
  { id: 20, name: 'Raticate', primaryType: 'Normal', secondaryType: null },
  { id: 21, name: 'Spearow', primaryType: 'Normal', secondaryType: 'Flying' },
  { id: 22, name: 'Fearow', primaryType: 'Normal', secondaryType: 'Flying' },
  { id: 23, name: 'Ekans', primaryType: 'Poison', secondaryType: null },
  { id: 24, name: 'Arbok', primaryType: 'Poison', secondaryType: null },
  { id: 25, name: 'Pikachu', primaryType: 'Electric', secondaryType: null },
] as const);

console.log(styleText('bold', '› Seeding database...'));

try {
  console.log(styleText('bold', `Creating users`));

  for (const data of users) {
    const user = await prisma.user.create({
      data: {
        ...data,
        password: (await hashPassword(data.password, data.salt)).toString(
          'hex',
        ),
      },
    });

    console.log(`  Created user ${styleText('blue', user.displayName)}.`);
  }

  console.log(styleText('bold', `Inserting Pokémon`));

  for (const data of pokemon) {
    const pokemon = await prisma.pokemon.create({
      data,
    });

    console.log(`  Inserted Pokémon ${styleText('blue', pokemon.name)}.`);
  }

  {
    console.log(styleText('bold', `Creating Caught Pokémon`));
    const pokemon = await prisma.pokemon.findMany();
    const users = await prisma.user.findMany();

    for (const user of users) {
      for (const poke of arrayShuffle(pokemon).slice(0, 10)) {
        await prisma.caughtPokemon.create({
          data: {
            nickname: poke.name,
            pokemon: { connect: { id: poke.id } },
            shiny: random(0, 10) === 0,
            stats: {
              attack: random(70, 110),
              defense: random(60, 100),
              hp: random(60, 120),
              level: random(1, 100),
              specialAttack: random(70, 110),
              specialDefense: random(60, 100),
              speed: random(70, 100),
            },
            user: { connect: { id: user.id } },
          },
        });
      }
    }
  }
  console.log(styleText(['green', 'bold'], '✓ Done.'));
} finally {
  await prisma.$disconnect();
}
