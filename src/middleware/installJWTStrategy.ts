import passport from 'passport';
import { Express } from 'express';
import { Strategy as JWTStrategy, ExtractJwt } from 'passport-jwt';

const installJWTStrategy = async (app: Express) => {
  passport.use(
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: process.env.JWT_SECRET,
      },
      (payload, done) => {
        done(null, payload);
      }
    )
  );
};

export default installJWTStrategy;
