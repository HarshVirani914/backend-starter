/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    create function app_public.current_user_id() returns uuid as $$
    select user_id from app_private.sessions where id = app_public.current_session_id();
    $$ language sql stable security definer set search_path to pg_catalog, public, pg_temp;
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropFunction({ schema: "app_public", name: "current_user_id" }, [""]);
}
