import passport from 'passport';
import { Express } from 'express';
import { Strategy as JWTStrategy, ExtractJwt, VerifiedCallback } from 'passport-jwt';

const installJWTStrategy = async (app: Express) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: jwtSecret,
      },
      (payload: any, done: VerifiedCallback) => {
        done(null, payload);
      }
    )
  );
};

export default installJWTStrategy;
