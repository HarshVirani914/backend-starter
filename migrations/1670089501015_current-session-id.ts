/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    create function app_public.current_session_id() returns uuid as $$
    select nullif(pg_catalog.current_setting('jwt.claims.session_id', true), '')::uuid;
    $$ language sql stable;
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropFunction({ schema: "app_public", name: "current_session_id" }, [""]);
}
