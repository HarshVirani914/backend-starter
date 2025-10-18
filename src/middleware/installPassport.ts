import { Express } from 'express';
import passport from 'passport';
import installJWTStrategy from './installJWTStrategy';

export default async (app: Express) => {
  // Initialize passport without session support (using JWT instead)
  const passportInitializeMiddleware = passport.initialize();
  app.use(passportInitializeMiddleware);

  // Install JWT strategy
  await installJWTStrategy(app);

  // Apply JWT authentication middleware to all routes
  app.use((req, res, next) =>
    passport.authenticate('jwt', { session: false }, (err: any, user: any) => {
      if (user) {
        req.user = user;
      }
      next();
    })(req, res, next)
  );
};
