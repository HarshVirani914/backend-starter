/* eslint-disable @typescript-eslint/naming-convention */
import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions | undefined = undefined;

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(
    `
        create table app_private.sessions (
            id uuid not null default gen_random_uuid() primary key,
            user_id uuid not null,
            created_at timestamptz not null default now(),
            last_active timestamptz not null default now()
        );

        alter table app_private.sessions
            drop constraint if exists sessions_user_id_fkey,
            add constraint sessions_user_id_fkey
                foreign key(user_id) references app_public.users(id) on delete cascade;

        create index on app_private.sessions(user_id);

        create function app_public.current_session_id() returns uuid as $$
            select nullif(pg_catalog.current_setting('jwt.claims.session_id', true), '')::uuid;
        $$ language sql stable security definer;

        create function app_public.current_user_id() returns uuid as $$
            select user_id from app_private.sessions where id = app_public.current_session_id();
        $$ language sql stable security definer;

        create function app_public.current_user_is_admin() returns boolean as $$
            select exists(select 1 from app_public.users where id = app_public.current_user_id() and is_admin is true)
        $$ language sql stable;
    `
  );
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.sql(`
    drop function if exists app_public.current_session_id();
    
    drop function if exists app_public.current_user_id();

    drop function if exists app_public.current_user_is_admin();

    drop table if exists app_private.sessions cascade;
  `);
}
