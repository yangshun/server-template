import builder from '../builder.tsx';

const CaughtPokemon = builder.prismaNode('CaughtPokemon', {
  fields: (t) => ({
    caughtAt: t.string({
      nullable: false,
      resolve: ({ caughtAt }) => String(caughtAt.getTime()),
    }),
    nickname: t.exposeString('nickname'),
    pokemon: t.relation('pokemon'),
    shiny: t.exposeBoolean('shiny', { nullable: false }),
    stats: t.string({
      nullable: false,
      resolve: ({ stats }) => JSON.stringify(stats),
    }),
    user: t.relation('user'),
  }),
  id: { field: 'id' },
});

export default CaughtPokemon;
