/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    create table app_public.users (
        id uuid primary key default gen_random_uuid(),
        email citext not null unique,
        password text,
        name text,
        is_admin boolean default false not null,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
    );

    alter table app_public.users 
        drop constraint if exists email_check,
        add constraint email_check check (email ~ '[^@]+@[^@]+\.[^@]+');

    create index on app_public.users(email);

    create index on app_public.users(password);
  `);
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `
        drop table if exists app_public.users cascade;
    `
  );
}
