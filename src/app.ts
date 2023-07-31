import express, { Express } from "express";
import { Server } from "http";
import * as middleware from "./middleware";
import { Middleware } from "postgraphile";
import dotenv from "dotenv";


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

  await middleware.installDatabasePools(app);
  await middleware.installPostGraphile(app);

  return app;
}


