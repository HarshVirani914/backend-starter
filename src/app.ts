import cors from "cors";
import dotenv from "dotenv";
import express, { Express } from "express";
import { Server } from "http";
import { Middleware } from "postgraphile";
import { installDatabasePools, installPassport, installPostGraphile } from "./middleware";


export function getHttpServer(app: Express): Server | null {
  return app.get("httpServer") ?? null;
}

export function getWebsocketMiddlewares(
  app: Express
): Middleware<express.Request, express.Response>[] {
  return app.get("websocketMiddlewares");
}

export const makeApp = async ({ httpServer }: {
  httpServer?: Server;
} = {}): Promise<Express> => {
  dotenv.config();
  const app: Express = express();

  app.set("httpServer", httpServer);

  app.use(cors())

  await installDatabasePools(app);
  await installPassport(app);
  await installPostGraphile(app);

  return app;
}


