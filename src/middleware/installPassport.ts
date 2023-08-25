import { Express } from 'express';
import passport from 'passport';
import installJWTStrategy from './installJWTStrategy';

interface DbSession {
  session_id: string;
}

declare global {
  namespace Express {
    interface User {
      session_id: string;
    }
  }
}

export default async (app: Express) => {
  passport.serializeUser((sessionObject: DbSession, done) => {
    console.log('sessionObject', sessionObject);
    done(null, sessionObject.session_id);
  });

  passport.deserializeUser((session_id: string, done) => {
    console.log('session_id', session_id);

    done(null, { session_id });
  });

  const passportInitializeMiddleware = passport.initialize();

  app.use(passportInitializeMiddleware);

  const passportSessionMiddleware = passport.session();

  app.use(passportSessionMiddleware);

  app.get('/logout', (req, res) => {
    req.logOut(() => {});
    res.redirect('/');
  });

  await installJWTStrategy(app);

  app.use((req, res, next) =>
    passport.authenticate('jwt', (err: any, user: any) => {
      if (user) {
        req.user = user;
      }
      next();
    })(req, res, next)
  );
};
