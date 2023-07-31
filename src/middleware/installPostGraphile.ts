import { Express, Request, Response } from "express";
import { postgraphile } from "postgraphile";

import { getRootPgPool } from "./installDatabasePools";

export default async function installPostGraphile(app: Express) {
  const rootPgPool = getRootPgPool(app);
  // Forbid PostGraphile from adding websocket listeners to httpServer
  const middleware = postgraphile<Request, Response>(
    rootPgPool,
    "public",
    {
      watchPg: true,
      graphiql: true,
      enhanceGraphiql: true,
    }
  );

  app.set("postgraphileMiddleware", middleware);

  app.use(middleware);
}
