#!/usr/bin/env NODE_ENV=development node_modules/.bin/nodemon -q -I --exec node --no-warnings --experimental-specifier-resolution=node --loader ts-node/esm --env-file .env
import { createServer } from 'node:http';
import { parseArgs, styleText } from 'node:util';
import parseInteger from '@nkzw/core/parseInteger.js';
import { fromNodeHeaders, toNodeHandler } from 'better-auth/node';
import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import { createYoga } from 'graphql-yoga';
import schema from './graphql/schema.tsx';
import { auth } from './lib/auth.tsx';
import env from './lib/env.tsx';
import prisma from './prisma/prisma.tsx';
import { SessionUser, toSessionUser } from './user/SessionUser.tsx';

try {
  await prisma.$connect();
} catch (error) {
  console.error(
    `${styleText(['red', 'bold'], 'Prisma Database Connection Error')}\n`,
    error,
  );
  process.exit(1);
}

const name = 'Pothos GraphQL Server';

const {
  values: { port: portArg },
} = parseArgs({
  options: {
    port: {
      default: '9000',
      short: 'p',
      type: 'string',
    },
  },
});

const domain = env('CLIENT_DOMAIN');
const port = (portArg && parseInteger(portArg)) || 9000;

const origin = (
  origin: unknown,
  callback: (error: Error | null, allowed?: boolean) => void,
) => {
  if (process.env.NODE_ENV === 'development' || !origin || origin === domain) {
    callback(null, true);
  } else {
    callback(new Error(`Invalid origin '${origin}'.`));
  }
};
const app = express();
const httpServer = createServer(app);

app.disable('x-powered-by');

app.use(
  cors({
    credentials: true,
    origin,
  }),
);

app.all('/api/auth/{*any}', toNodeHandler(auth));

app.use((req, res, next) => bodyParser.json({ strict: false })(req, res, next));

const yoga = createYoga<
  Readonly<{
    req: express.Request & {
      user?: SessionUser;
    };
  }>
>({
  context: async ({ req }) => {
    const user = (
      await auth.api.getSession({
        headers: fromNodeHeaders(req.headers),
      })
    )?.user;

    return {
      sessionUser: user ? toSessionUser(user) : null,
    };
  },
  graphiql: process.env.NODE_ENV === 'development',
  schema,
});

app.use('/graphql', (req, res) => yoga(req, res));

app.all('/{*splat}', (_, res) => {
  res.redirect(domain);
});

httpServer.listen(port, () =>
  console.log(
    `${styleText(['green', 'bold'], `${name}\n  ➜`)}  Server running on port ${styleText('bold', String(port))}.\n`,
  ),
);

const setTitle = (title: string) => {
  process.title = title;
  if (process.stdout.isTTY) {
    process.stdout.write(
      `${String.fromCharCode(27)}]0;🚀 ${title}${String.fromCharCode(7)}`,
    );
  }
};
setTimeout(() => setTitle(name), 0);
