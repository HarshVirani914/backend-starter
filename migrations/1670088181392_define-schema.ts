/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from "node-pg-migrate";

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    drop schema if exists app_public cascade;
    drop schema if exists app_hidden cascade;
    drop schema if exists app_private cascade;

    revoke all on schema public from public;

    alter default privileges revoke all on sequences from public;
    alter default privileges revoke all on functions from public;

    grant all on schema public to ${process.env.DATABASE_OWNER};

    create schema app_public;
    create schema app_hidden;
    create schema app_private;

    grant usage on schema public, app_public, app_hidden to ${process.env.DATABASE_VISITOR};

    alter default privileges in schema public, app_public, app_hidden
    grant usage, select on sequences to ${process.env.DATABASE_VISITOR};

    alter default privileges in schema public, app_public, app_hidden
    grant execute on functions to ${process.env.DATABASE_VISITOR};

    CREATE EXTENSION IF NOT EXISTS citext WITH SCHEMA public;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropExtension("citext");
  pgm.dropExtension("uuid-ossp");
}
