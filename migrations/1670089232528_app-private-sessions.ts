/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    create table app_private.sessions (
        id uuid not null default gen_random_uuid() primary key,
        user_id uuid not null,
        created_at timestamptz not null default now(),
        last_active timestamptz not null default now()
      );`);

  pgm.alterTable(
    { schema: "app_private", name: "sessions" },
    { levelSecurity: "ENABLE" }
  );

  pgm.createIndex({ schema: "app_private", name: "sessions" }, "user_id");
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropIndex({ schema: "app_private", name: "sessions" }, "user_id");
  pgm.dropTable({ schema: "app_private", name: "sessions" });
}
