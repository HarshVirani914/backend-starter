/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    create table app_public.users (
        id uuid primary key default gen_random_uuid(),
        email citext not null check (email ~ '[^@]+@[^@]+\.[^@]+'),
        password text,
        name text,
        type text not null default 'user',
        is_admin boolean not null default false,
        is_verified boolean not null default false,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
  );

  grant all on app_public.users to ${process.env.DATABASE_VISITOR};
`);

  pgm.addIndex({ schema: "app_public", name: "users" }, ["email", "name"]);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable({ schema: "app_public", name: "users" });
}
