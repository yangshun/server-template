import { PrismaSessionStore } from '@quixo3/prisma-session-store';
import type { Express } from 'express';
import expressSession from 'express-session';
import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import { encodeUserID } from '../graphql/nodes/User.tsx';
import env from '../lib/env.tsx';
import type { User } from '../prisma/prisma-client/client.ts';
import prisma from '../prisma/prisma.tsx';
import generateSalt from './generateSalt.tsx';
import { hashPassword } from './hashPassword.tsx';
import isEmail from './isEmail.tsx';
import isValidName from './isValidName.tsx';
import isValidPassword from './isValidPassword.tsx';
import passwordMatches from './passwordMatches.tsx';
import { toSessionUser } from './SessionUser.tsx';

const AuthenticationError = (message: string) => ({
  message,
  name: 'AuthenticationError',
});

export default function install(app: Express) {
  passport.use(
    new LocalStrategy(
      {
        passwordField: 'password',
        usernameField: 'email',
      },
      async (name, password, callback) => {
        const user = await prisma.user.findFirst({
          where: name.includes('@')
            ? { email: { equals: name, mode: 'insensitive' } }
            : { username: { equals: name, mode: 'insensitive' } },
        });

        if (!user) {
          return callback(AuthenticationError('authentication-error'), false);
        }
        if (
          !passwordMatches(
            await hashPassword(password, user.salt),
            user.password,
          )
        ) {
          return callback(AuthenticationError('authentication-error'), false);
        }
        if (user.suspended) {
          return callback(AuthenticationError('suspended'), false);
        }
        return callback(null, toSessionUser(user));
      },
    ),
  );

  passport.serializeUser((user, cb) => {
    process.nextTick(() => cb(null, toSessionUser(user as User)));
  });

  passport.deserializeUser((user: User, cb) => {
    process.nextTick(() => cb(null, user));
  });

  const session = expressSession({
    cookie: {
      maxAge: 15 * 24 * 60 * 60 * 1000,
    },
    resave: false,
    rolling: true,
    saveUninitialized: false,
    secret: env('PASSPORT_SECRET'),
    store: new PrismaSessionStore(prisma, {
      checkPeriod: 12 * 60 * 60 * 1000,
      dbRecordIdFunction: undefined,
      dbRecordIdIsSessionId: true,
    }),
  });
  app.use(session);

  app.use(passport.authenticate('session'));

  app.post(
    '/user/login',
    passport.authenticate('local', {
      failWithError: true,
    }),
    (req, res) => {
      req.session.save();
      res.json({
        success: true,
        user: {
          ...req.user,
          id: encodeUserID((req.user as User).id),
        },
      });
    },
  );

  app.post('/user/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.post('/user/register', async (req, res, next) => {
    if (req.user) {
      return next();
    }

    const { email, password, username } = req.body;
    if (
      !email ||
      !password ||
      !username ||
      username.length > 32 ||
      !isValidPassword(password) ||
      !isValidName(username) ||
      !isEmail(email)
    ) {
      res.json({ message: 'invalid-username-or-password' });
      return;
    }

    const existingUsers = await prisma.user.findMany({
      where: {
        OR: [
          { email: { equals: email, mode: 'insensitive' } },
          { username: { equals: email, mode: 'insensitive' } },
          { username: { equals: username, mode: 'insensitive' } },
        ],
      },
    });

    if (existingUsers.length) {
      res.json({ message: 'username-or-email-taken' });
      return;
    }

    const salt = generateSalt();

    let user: User | undefined;
    try {
      user = await prisma.user.create({
        data: {
          displayName: username,
          email,
          password: (await hashPassword(password, salt)).toString('hex'),
          salt,
          username,
        },
      });
    } catch {
      res.json({
        message: `oops-username`,
      });
      return;
    }

    if (!user) {
      res.json({ message: 'invalid-username-or-password' });
      return;
    }

    req.login(toSessionUser(user), (error) => {
      if (error) {
        return next(error);
      }

      req.session.save();
      res.json({
        success: true,
        user: {
          ...req.user,
          id: encodeUserID(user.id),
        },
      });
    });
  });
}
