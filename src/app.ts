import cors from 'cors';
import dotenv from 'dotenv';
import express, { Express } from 'express';
import { Server } from 'http';
import { Middleware } from 'postgraphile';
import {
  installDatabase,
  installPassport,
  installPostGraphile,
} from './middleware';
import { ShutdownAction, makeShutdownActions } from './shutdownActions';

export function getHttpServer(app: Express): Server | null {
  return app.get('httpServer') ?? null;
}

export function getShutdownActions(app: Express): ShutdownAction[] {
  return app.get("shutdownActions");
}

export function getWebsocketMiddlewares(
  app: Express
): Middleware<express.Request, express.Response>[] {
  return app.get('websocketMiddlewares');
}

export const makeApp = async ({
  httpServer,
}: {
  httpServer?: Server;
} = {}): Promise<Express> => {
  dotenv.config();

  const shutdownActions = makeShutdownActions();

  const app: Express = express();

  app.set('httpServer', httpServer);

  app.set("shutdownActions", shutdownActions);

  app.use(cors());

  await installDatabase(app);
  await installPassport(app);
  await installPostGraphile(app);

  return app;
};
